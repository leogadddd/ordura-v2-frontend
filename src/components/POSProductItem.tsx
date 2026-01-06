interface POSProductItemProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string | null;
    notes?: string;
  };
  onAddToCart: (product: {
    id: string;
    name: string;
    price: number;
    notes?: string;
  }) => void;
}

export function POSProductItem({ product, onAddToCart }: POSProductItemProps) {
  return (
    <button
      onClick={() => onAddToCart(product)}
      className="flex flex-col h-full border border-gray-300 rounded-xl bg-white overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-md active:scale-95"
    >
      {/* Image Container */}
      <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-300 text-2xl">📦</div>
        )}
        <div className="absolute inset-0 w-full h-full bg-primary-lighter opacity-15"></div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col justify-between flex-1 p-2">
        <h3 className="font-bold text-md line-clamp-2 text-gray-800">
          {product.name}
        </h3>

        {/* Price Badge */}
        <div className="mt-1 py-1.5 px-2 bg-primary rounded-xl text-center">
          <span className="text-white font-bold text-xs">
            ₱{product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  );
}

export default POSProductItem;
