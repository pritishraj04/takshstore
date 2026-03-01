import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const code = formData.get('code');
        const transactionId = formData.get('transactionId');

        // PhonePe responds with HTTP POST to the redirectUrl when the payment is complete
        if (code === 'PAYMENT_SUCCESS' && transactionId) {

            // Securely notify our backend to transition the PRISMA Order state
            await axios.post('http://localhost:4000/payments/verify-local', {
                transactionId,
                status: 'PAID'
            });

            return NextResponse.redirect(new URL(`/dashboard?payment=success&transaction=${transactionId}`, req.url), 303);
        } else {
            return NextResponse.redirect(new URL(`/dashboard?payment=failed&transaction=${transactionId}`, req.url), 303);
        }

    } catch (error) {
        console.error('Error handling PhonePe callback:', error);
        return NextResponse.redirect(new URL(`/dashboard?payment=failed`, req.url), 303);
    }
}
