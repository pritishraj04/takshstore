import { MessageSquare, Star, User } from 'lucide-react';

interface ReviewsTileProps {
  reviews: any[];
}

export function ReviewsTile({ reviews }: ReviewsTileProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 underline underline-offset-4 decoration-indigo-600 decoration-2 italic">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Recent Reviews
        </h3>
        <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-indigo-100">Live Feedback</span>
      </div>

      <div className="space-y-4 mt-6 overflow-y-auto max-h-[320px] scrollbar-hide">
        {reviews && reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-indigo-100 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Verified Buyer</p>
                  </div>
                </div>
                <div className="flex bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-400 truncate mb-1">
                  Product: <span className="font-semibold text-gray-600 tracking-tight">{review.product?.title}</span>
                </p>
                <p className="text-sm text-gray-700 italic font-medium leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm italic">
            No recent reviews found
          </div>
        )}
      </div>
    </div>
  );
}
