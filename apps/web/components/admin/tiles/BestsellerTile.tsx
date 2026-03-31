import { ShoppingBag } from 'lucide-react';

interface BestsellerTileProps {
  products: any[];
}

export function BestsellerTile({ products }: BestsellerTileProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Bestsellers</h3>
          <p className="text-xs text-gray-500 mt-1">Top 5 by unit sales</p>
        </div>
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
          <ShoppingBag className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-4">
        {products && products.length > 0 ? (
          products.map((product, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {product.title}
                </p>
                <p className="text-xs text-gray-500">
                  {product.salesCount} sold • ₹{product.price}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  #{idx + 1}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm italic">
            No sales data for this period
          </div>
        )}
      </div>
    </div>
  );
}
