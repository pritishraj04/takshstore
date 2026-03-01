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

        if (code) {
            try {
                console.log(`Attempting to sync PhonePe Status [${code}] for TxID: ${transactionId} in NestJS...`);
                const nestResponse = await axios.post('http://localhost:4000/api/payments/verify-local', {
                    transactionId: transactionId,
                    status: code // Send the exact PhonePe code to NestJS for parsing
                });
                console.log('NestJS Sync Successful:', nestResponse.data);
            } catch (error: any) {
                console.error('--- NESTJS SYNC FAILED ---');
                console.error('Error Message:', error.message);
                console.error('NestJS Data:', error.response?.data);
            }
        }

        // Redirect based on the code returned
        if (code === 'PAYMENT_SUCCESS' || code === 'PAYMENT_PENDING') {
            return NextResponse.redirect(new URL(`/dashboard?payment=success&transaction=${transactionId}`, req.url), 303);
        } else {
            return NextResponse.redirect(new URL(`/dashboard?payment=failed&transaction=${transactionId}`, req.url), 303);
        }

    } catch (error) {
        console.error('Error handling PhonePe callback:', error);
        return NextResponse.redirect(new URL(`/dashboard?payment=failed`, req.url), 303);
    }
}
