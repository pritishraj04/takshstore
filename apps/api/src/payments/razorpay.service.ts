import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
    private readonly razorpay: Razorpay;

    constructor() {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            console.warn('Razorpay credentials not defined yet.');
        }

        this.razorpay = new Razorpay({
            key_id: key_id || 'test',
            key_secret: key_secret || 'test'
        });
    }

    async createOrder(amount: number, receiptId: string) {
        try {
            const order = await this.razorpay.orders.create({
                amount: Math.round(amount * 100), // convert to paise
                currency: 'INR',
                receipt: receiptId,
            });
            return order;
        } catch (error: any) {
            console.error('RAZORPAY CREATE ORDER ERROR:', error);
            throw new InternalServerErrorException('Failed to create Razorpay order');
        }
    }

    verifySignature(orderId: string, paymentId: string, signature: string): boolean {
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            throw new InternalServerErrorException('Razorpay credentials not defined');
        }

        const generatedSignature = crypto
            .createHmac('sha256', key_secret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        return generatedSignature === signature;
    }
}
