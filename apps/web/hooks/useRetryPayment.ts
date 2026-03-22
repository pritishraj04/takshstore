import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { toast } from 'sonner';

export function useRetryPayment() {
    return useMutation({
        mutationFn: async (orderId: string) => {
            const { data } = await apiClient.post(`/checkout/retry`, { orderId });
            return data;
        },
        onSuccess: (data) => {
            if (data?.razorpayOrderId) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        amount: data.amount,
                        currency: data.currency,
                        name: "Taksh Store",
                        description: "Retry Payment",
                        order_id: data.razorpayOrderId,
                        handler: async function (response: any) {
                            toast.loading('Verifying your payment securely...', { id: 'retry-toast' });
                            try {
                                await apiClient.post('/checkout/verify', {
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpaySignature: response.razorpay_signature
                                });
                                toast.success('Payment verified successfully! Your order is confirmed.', { id: 'retry-toast' });
                                window.location.reload(); 
                            } catch (err: any) {
                                toast.error('Payment verification failed. Please contact support.', { id: 'retry-toast' });
                                window.location.reload(); 
                            }
                        },
                        theme: { color: "#111827" },
                        modal: {
                            ondismiss: function () {
                                toast.error('Payment was cancelled.');
                            }
                        }
                    };
                    const rzp = new (window as any).Razorpay(options);
                    rzp.on('payment.failed', function (response: any) {
                        toast.error(`Payment failed: ${response.error.description}`);
                    });
                    rzp.open();
                };
                document.body.appendChild(script);
            } else {
                toast.error('Failed to initialize payment gateway.');
            }
        },
        onError: (error: any) => {
            console.error('RETRY MUTATION FAILED:', error);
            toast.error(error?.response?.data?.message || 'Failed to initialize retry session. Please check with your bank.');
        }
    });
}
