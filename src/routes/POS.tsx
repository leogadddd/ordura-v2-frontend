import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useProducts } from "@/hooks/useProducts";
import { POSProductItem } from "@/components/POSProductItem";
import { AddToCartModal } from "@/components/modals/AddToCartModal";
import { Cart } from "@/components/Cart";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    price: number;
    notes?: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useProducts({
    includeDrafts: false, // Only show active products in POS
  });

  // Transform products data for POS display
  const products =
    data?.data?.items?.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.sellingPrice,
      category: product.category,
      notes: product.notes,
      image: null, // TODO: Add image field to database schema
    })) || [];

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category))
  ).sort();

  // Reset selected category if no products are available
  if (products.length === 0 && selectedCategory !== null) {
    setSelectedCategory(null);
  }

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === null || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: { id: string; name: string; price: number }) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmAddToCart = (productWithDetails: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }) => {
    const existing = cart.find((item) => item.id === productWithDetails.id);
    if (existing) {
      // If item exists, replace quantity instead of adding to it
      setCart(
        cart.map((item) =>
          item.id === productWithDetails.id
            ? { ...item, quantity: productWithDetails.quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...productWithDetails }]);
    }
    setIsModalOpen(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = () => {
    // TODO: Implement place order functionality
    console.log("Place order", cart);
  };

  const handleEditItem = (item: CartItem) => {
    setSelectedProduct({
      id: item.id,
      name: item.name,
      price: item.price,
      notes: products.find(p => p.id === item.id)?.notes,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onConfirm={handleConfirmAddToCart}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col min-h-0 p-6">
          <header className="mb-4">
            <h1 className="text-2xl font-semibold text-primary">
              Point of Sale
            </h1>
            <p className="text-sm text-gray-600">
              Process customer transactions and manage orders.
            </p>
          </header>
          <div className="mb-3 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl"
            />
          </div>

          {/* Category Filter Bar */}
          <div className="mb-3">
            <div
              className="flex gap-2 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {products.length > 0 && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === null
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Categories
                </button>
              )}
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    selectedCategory === category
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading products...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-500 text-sm">
                  Error loading products. Please try again.
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">
                  {searchQuery
                    ? "No products found matching your search."
                    : "No products available."}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <POSProductItem
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <Cart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onClear={clearCart}
          onPlaceOrder={handlePlaceOrder}
          onEditItem={handleEditItem}
        />
      </div>
    </div>
  );
}

export default POSPage;
