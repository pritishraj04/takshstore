import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const payload = Object.fromEntries(formData.entries());
        console.log('--- PHONEPE CALLBACK PAYLOAD ---', payload);

        const transactionId = payload.transactionId || payload.merchantTransactionId;
        const code = payload.code;
        console.log('Extracted -> Code:', code, 'TransactionId:', transactionId);

        if (code === 'PAYMENT_SUCCESS') {
            try {
                console.log(`Attempting to update Order ${transactionId} to PAID in NestJS...`);
                const nestResponse = await axios.post('http://localhost:4000/api/payments/verify-local', {
                    transactionId: transactionId,
                    status: 'PAID'
                });
                console.log('NestJS Response:', nestResponse.data);
            } catch (error: any) {
                console.error('--- NESTJS UPDATE FAILED ---');
                console.error('Error Message:', error.message);
                console.error('NestJS Data:', error.response?.data);
            }
        } else {
            console.log('Payment was not successful. Code received:', code);
        }

        if (code === 'PAYMENT_SUCCESS') {
            return NextResponse.redirect(new URL(`/dashboard?payment=success&transaction=${transactionId}`, req.url), 303);
        } else {
            return NextResponse.redirect(new URL(`/dashboard?payment=failed&transaction=${transactionId}`, req.url), 303);
        }

    } catch (error) {
        console.error('Error handling PhonePe callback:', error);
        return NextResponse.redirect(new URL(`/dashboard?payment=failed`, req.url), 303);
    }
}
