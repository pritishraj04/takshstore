import { Injectable, InternalServerErrorException, BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
    ) { }

    async createPhonePeOrder(amount: number, orderId: string, userId: string, mobileNumber?: string) {
        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX;
        const env = process.env.PHONEPE_ENV; // UAT or PROD

        if (!merchantId || !saltKey || !saltIndex) {
            throw new InternalServerErrorException('PhonePe credentials not configured');
        }

        const isUat = env !== 'PROD';
        const url = isUat
            ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'
            : 'https://api.phonepe.com/apis/hermes/pg/v1/pay';

        // NOTE: The redirect URL should point to your Next.js API route that handles the POST callback
        // PhonePe strictly restricts merchantTransactionId and merchantUserId to 35 characters max.
        // Prisma standard UUIDs are 36 characters length. By stripping hyphens we reduce it to safely 32 characters.
        const paymentPayload = {
            merchantId,
            merchantTransactionId: orderId.replace(/-/g, ''),
            merchantUserId: userId.replace(/-/g, ''),
            amount: Math.round(amount * 100), // in paise
            redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/payment/callback`,
            redirectMode: 'POST',
            callbackUrl: `${process.env.API_URL || 'http://localhost:4000/api'}/payments/webhook`, // Server-to-server webhook
            mobileNumber: mobileNumber || '9097785207', // PhonePe often requires a valid 10-digit number
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };

        const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
        const checksum = crypto.createHash('sha256').update(base64Payload + '/pg/v1/pay' + saltKey).digest('hex');
        const xVerifyHeader = `${checksum}###${saltIndex}`;

        try {
            const response = await axios.post(
                url,
                { request: base64Payload },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': xVerifyHeader,
                        'accept': 'application/json',
                    },
                }
            );

            if (response.data?.success) {
                return { redirectUrl: response.data.data.instrumentResponse.redirectInfo.url };
            } else {
                console.error("PhonePe order creation failed:", response.data);
                throw new InternalServerErrorException("Failed to initialize payment gateway");
            }
        } catch (error: any) {
            console.error('PHONEPE API ERROR:', error.response?.data || error.message);
            throw new InternalServerErrorException(
                error.response?.data || { message: 'Failed to initiate payment with PhonePe' }
            );
        }
    }

    async processOrderSuccess(orderId: string) {
        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'PAID' },
            include: { user: true, items: { include: { digitalInvite: true, product: true } } },
        });

        for (const item of order.items) {
            if (item.digitalInvite && item.digitalInvite.status === 'DRAFT') {
                const inviteData = item.digitalInvite.inviteData as any;
                let latestDate: Date | null = null;
                if (inviteData?.celebrations && Array.isArray(inviteData.celebrations)) {
                    const times = inviteData.celebrations
                        .map((c: any) => new Date(c.date).getTime())
                        .filter((t: number) => !isNaN(t));
                    if (times.length > 0) {
                        latestDate = new Date(Math.max(...times));
                    }
                }

                const brideName = inviteData?.couple?.bride?.name || null;
                const groomName = inviteData?.couple?.groom?.name || null;

                await this.prisma.digitalInvite.update({
                    where: { id: item.digitalInvite.id },
                    data: { 
                        status: 'DEVELOPMENT',
                        originalEventDate: latestDate,
                        originalBrideName: brideName,
                        originalGroomName: groomName
                    }
                });

                // Trigger Digital Access Mail
                const customizerToken = this.jwtService.sign(
                  { id: item.digitalInvite.id, type: 'CUSTOMIZER_ACCESS' },
                  { expiresIn: '90d', secret: process.env.JWT_SECRET || 'dev_secret' }
                );
                const customizerLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/customizer/${item.digitalInvite.slug}?token=${customizerToken}`;
                
                await this.mailService.sendDigitalInviteAccess(order.user.email, customizerLink);

            } else if (!item.digitalInvite) {
                // Assuming Physical Canvas Print
                const breakdownText = `Product: ${item.product.title} (x${item.quantity}) - ₹${item.priceAtPurchase * item.quantity}`;
                await this.mailService.sendCanvasReceipt(order.user.email, breakdownText);
            }
        }
    }

    async verifyPhonePeCallback(body: any, xVerifyHeader: string) {
        const saltKey = process.env.PHONEPE_SALT_KEY;
        if (!saltKey) {
            throw new InternalServerErrorException('PhonePe salt key not configured');
        }

        // body.response is the base64 encoded string from PhonePe
        const checksum = crypto.createHash('sha256').update(body.response + saltKey).digest('hex');
        const calculatedVerifyHeader = `${checksum}###${process.env.PHONEPE_SALT_INDEX}`;

        if (calculatedVerifyHeader !== xVerifyHeader) {
            throw new UnauthorizedException('Invalid payment signature');
        }

        const decodedResponse = JSON.parse(Buffer.from(body.response, 'base64').toString('utf-8'));

        if (decodedResponse.success && decodedResponse.code === 'PAYMENT_SUCCESS') {
            let rawTransactionId = decodedResponse.data.merchantTransactionId;

            // Strip any retry suffix (which pushes length beyond the base 32 char un-hyphenated UUID)
            if (rawTransactionId && rawTransactionId.length > 32) {
                rawTransactionId = rawTransactionId.substring(0, 32);
            }

            let orderId = rawTransactionId;
            // Restore hyphens since Prisma requires strictly formatted 36-char UUIDs
            if (rawTransactionId && rawTransactionId.length === 32) {
                orderId = `${rawTransactionId.slice(0, 8)}-${rawTransactionId.slice(8, 12)}-${rawTransactionId.slice(12, 16)}-${rawTransactionId.slice(16, 20)}-${rawTransactionId.slice(20)}`;
            }

            await this.processOrderSuccess(orderId);
        }

        return { success: true };
    }

    async verifyLocalPayment(transactionId: string, status: string) {
        // Strip any retry suffix to isolate the true database Order ID
        // The base UUID without hyphens is guaranteed to be exactly 32 characters
        let rawTransactionId = transactionId && transactionId.length > 32
            ? transactionId.substring(0, 32)
            : transactionId;

        let orderId = rawTransactionId;

        // Restore hyphens
        if (rawTransactionId && rawTransactionId.length === 32) {
            orderId = `${rawTransactionId.slice(0, 8)}-${rawTransactionId.slice(8, 12)}-${rawTransactionId.slice(12, 16)}-${rawTransactionId.slice(16, 20)}-${rawTransactionId.slice(20)}`;
        }

        const order = await this.prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        if (status === 'PAYMENT_SUCCESS') {
            await this.processOrderSuccess(orderId);
        } else if (status === 'PAYMENT_ERROR' || status === 'PAYMENT_DECLINED') {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'FAILED' as any },
            });
        }
        // If status === 'PAYMENT_PENDING' or similar, we intentionally leave the DB state as PENDING

        return { success: true };
    }

    async retryPhonePePayment(orderId: string, userId: string) {
        // 1. Fetch the existing order
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('Access denied to this order');
        }

        // 2. We only allow retries on FAILED or PENDING orders, not PAID ones
        if (order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SHIPPED') {
            throw new BadRequestException('Cannot retry a completed payment');
        }

        if ((order.status as string) !== 'FAILED' && order.status !== 'PENDING') {
            throw new BadRequestException('Only failed or pending orders can be retried');
        }

        // 3. Generate a fresh Transaction ID so PhonePe doesn't block it as a duplicate
        // PhonePe max length is 35 chars. The UUID strings minus hyphens yield 32 chars.
        // We securely append 'R' and 2 random digits to ensure it never exceeds limits.
        const rawUuid = order.id.replace(/-/g, '');
        const retrySuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const retryTxId = `${rawUuid}R${retrySuffix}`; // Exactly 35 chars

        // 4. Send the new request to PhonePe using the existing amount
        // Note: createPhonePeOrder strips hyphens natively, but our string is already un-hyphenated
        return this.createPhonePeOrder(order.totalAmount, retryTxId, userId);
    }
}
