import { Injectable, InternalServerErrorException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) { }

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
            redirectUrl: 'http://localhost:3000/api/payment/callback',
            redirectMode: 'POST',
            callbackUrl: 'http://localhost:4000/api/payments/webhook', // Server-to-server webhook
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
            const rawTransactionId = decodedResponse.data.merchantTransactionId;
            let orderId = rawTransactionId;
            // Restore hyphens if the returned ID is 32 characters (hyphens were stripped before sending to PhonePe)
            if (rawTransactionId && rawTransactionId.length === 32) {
                orderId = `${rawTransactionId.slice(0, 8)}-${rawTransactionId.slice(8, 12)}-${rawTransactionId.slice(12, 16)}-${rawTransactionId.slice(16, 20)}-${rawTransactionId.slice(20)}`;
            }

            const order = await this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' },
                include: { items: { include: { digitalInvite: true } } },
            });

            for (const item of order.items) {
                if (item.digitalInvite && item.digitalInvite.status === 'DRAFT') {
                    await this.prisma.digitalInvite.update({
                        where: { id: item.digitalInvite.id },
                        data: { status: 'DEVELOPMENT' }
                    });
                }
            }
        }

        return { success: true };
    }

    async verifyLocalPayment(transactionId: string, status: string) {
        let orderId = transactionId;
        // Restore hyphens if the returned ID is 32 characters (hyphens were stripped before sending to PhonePe)
        if (transactionId && transactionId.length === 32) {
            orderId = `${transactionId.slice(0, 8)}-${transactionId.slice(8, 12)}-${transactionId.slice(12, 16)}-${transactionId.slice(16, 20)}-${transactionId.slice(20)}`;
        }

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { digitalInvite: true } } },
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        if (order.status === 'PENDING' && status === 'PAID') {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' },
            });

            for (const item of order.items) {
                if (item.digitalInvite && item.digitalInvite.status === 'DRAFT') {
                    await this.prisma.digitalInvite.update({
                        where: { id: item.digitalInvite.id },
                        data: { status: 'DEVELOPMENT' },
                    });
                }
            }
        }

        return { success: true };
    }
}
