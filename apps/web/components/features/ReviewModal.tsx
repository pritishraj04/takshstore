import { useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { toast } from 'sonner';
import { X, Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    productId: string;
    productName: string;
}

export function ReviewModal({ isOpen, onClose, orderId, productId, productName }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const queryClient = useQueryClient();

    const submitReview = useMutation({
        mutationFn: async () => {
            const res = await apiClient.post('/reviews', {
                orderId,
                productId,
                rating,
                comment
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Review submitted for approval!');
            queryClient.invalidateQueries({ queryKey: ['order-reviews', orderId] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#FBFBF9] border border-gray-200 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
                    <h3 className="font-playfair text-2xl text-primary tracking-wide">Leave a Review</h3>
                    <button onClick={onClose} className="text-secondary hover:text-black transition-colors rounded-full p-1 hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8 space-y-8">
                    <div className="space-y-2">
                        <p className="font-inter text-sm text-secondary tracking-wide uppercase">Product</p>
                        <p className="font-playfair text-xl">{productName}</p>
                    </div>

                    <div className="space-y-4">
                        <label className="font-inter text-sm text-secondary tracking-widest uppercase block">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star 
                                        size={32} 
                                        className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="font-inter text-sm text-secondary tracking-widest uppercase block">Comment (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder="Share your experience with this product..."
                            className="w-full bg-white border border-gray-200 p-4 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none font-inter text-sm"
                        />
                    </div>

                    <button
                        onClick={() => submitReview.mutate()}
                        disabled={rating === 0 || submitReview.isPending}
                        className="w-full bg-[#1A1A1A] text-[#FBFBF9] py-4 rounded-lg font-inter text-xs tracking-widest uppercase font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}
