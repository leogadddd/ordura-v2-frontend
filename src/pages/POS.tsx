import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { Select } from "@/components/ui/Select";
import { useProducts } from "@/hooks/useProducts";
import { useLocations } from "@/hooks/useInventory";
import type { Location } from "@/api/inventoryApi";
import { POSProductItem } from "@/components/POSProductItem";
import { AddToCartModal } from "@/components/modals/AddToCartModal";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import { Cart } from "@/components/Cart";
import { createOrder } from "@/api/createOrderApi";
import { showToast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { ShoppingCart } from "lucide-react";

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
    quantity?: number;
  } | null>(null);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // location state
  const { data: locData } = useLocations();
  const locations: Location[] = locData || [];
  const [locationId, setLocationId] = useState<string | undefined>(
    locations[0]?.id,
  );

  // Fee state
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const { data, isLoading, error } = useProducts({
    includeDrafts: false, // Only show active products in POS
  });

  // transform locations when they load
  useEffect(() => {
    if (locations.length > 0 && !locationId) {
      setLocationId(locations[0].id);
    }
  }, [locations, locationId]);

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
    new Set(products.map((p) => p.category)),
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
    setIsAddToCartModalOpen(true);
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
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...productWithDetails }]);
    }
    setIsAddToCartModalOpen(false);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const [isNoPaymentConfirmOpen, setIsNoPaymentConfirmOpen] = useState(false);
  const [autoConfirmPayment, setAutoConfirmPayment] = useState<{
    method: string;
    amountReceived: number;
  } | null>(null);

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      showToast.error("Cart is empty");
      return;
    }

    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const discountedSubtotal = subtotal - orderDiscount;
    const taxableBase = Math.max(
      0,
      discountedSubtotal + serviceFee + deliveryFee,
    );
    const taxAmount = taxableBase * 0.12;
    const grandTotal = taxableBase + taxAmount;

    // If the grand total is zero or negative, prompt confirmation to create order with no payment required
    if (grandTotal <= 0) {
      setIsNoPaymentConfirmOpen(true);
      return;
    }

    setIsCheckoutModalOpen(true);
  };

  const handleConfirmPayment = async (payment: {
    method: string;
    amountReceived: number;
  }) => {
    setIsSubmitting(true);
    try {
      // Calculate totals
      const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const discountedSubtotal = subtotal - orderDiscount;
      const taxableBase = Math.max(
        0,
        discountedSubtotal + serviceFee + deliveryFee,
      );
      const taxAmount = taxableBase * 0.12;
      const grandTotal = taxableBase + taxAmount;

      // Create order
      const res = await createOrder({
        locationId,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
          taxRate: 0.12,
        })),
        subtotal,
        orderDiscount,
        serviceFee,
        deliveryFee,
        taxTotal: taxAmount,
        grandTotal,
        paymentMethod: payment.method,
        amountReceived: payment.amountReceived,
      });

      showToast.success("Order placed successfully!");
      setCart([]);
      setOrderDiscount(0);
      setServiceFee(0);
      setDeliveryFee(0);

      return res;
    } catch (error: any) {
      console.error("Failed to place order:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to place order";
      showToast.error(String(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmNoPayment = async () => {
    // Instead of creating an order directly, open the Checkout modal and auto-confirm with NONE/0
    setIsNoPaymentConfirmOpen(false);
    setAutoConfirmPayment({ method: "NONE", amountReceived: 0 });
    setIsCheckoutModalOpen(true);
  };

  const handleEditItem = (item: CartItem) => {
    setSelectedProduct({
      id: item.id,
      name: item.name,
      price: item.price,
      notes: products.find((p) => p.id === item.id)?.notes,
      quantity: item.quantity,
    });
    setIsAddToCartModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <AddToCartModal
        isOpen={isAddToCartModalOpen}
        onClose={() => setIsAddToCartModalOpen(false)}
        product={selectedProduct}
        onConfirm={handleConfirmAddToCart}
      />
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          setAutoConfirmPayment(null);
        }}
        cartItems={cart}
        subtotal={cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        )}
        orderDiscount={orderDiscount}
        serviceFee={serviceFee}
        deliveryFee={deliveryFee}
        onConfirmPayment={handleConfirmPayment}
        isLoading={isSubmitting}
        autoConfirm={autoConfirmPayment}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col min-h-0 p-4">
          {/* <header className="mb-4">
            <h1 className="text-2xl font-semibold text-primary">
              Point of Sale
            </h1>
            <p className="text-sm text-gray-600">
              Process customer transactions and manage orders.
            </p>
          </header> */}
          <div className="mb-3 relative flex items-center gap-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl"
            />
            {/* <Select
              value={locationId}
              onChange={(e) => setLocationId(String(e.target.value))}
              options={locations.map((l) => ({ label: l.name, value: l.id }))}
              placeholder="Location"
              className="w-40 ml-2"
            /> */}
            <Button
              onClick={() => setIsCartModalOpen(true)}
              variant="secondary"
              size="sm"
              className="block lg:hidden border-none"
            >
              <ShoppingCart className="w-6 h-6" />
            </Button>
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
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
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
          orderDiscount={orderDiscount}
          serviceFee={serviceFee}
          deliveryFee={deliveryFee}
          onOrderDiscountChange={setOrderDiscount}
          onServiceFeeChange={setServiceFee}
          onDeliveryFeeChange={setDeliveryFee}
        />

        {/* Cart Modal for Mobile */}
        {isCartModalOpen && (
          <Cart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            onPlaceOrder={handlePlaceOrder}
            onEditItem={handleEditItem}
            orderDiscount={orderDiscount}
            serviceFee={serviceFee}
            deliveryFee={deliveryFee}
            onOrderDiscountChange={setOrderDiscount}
            onServiceFeeChange={setServiceFee}
            onDeliveryFeeChange={setDeliveryFee}
            isModal={true}
            onCloseModal={() => setIsCartModalOpen(false)}
            showHeader={false}
          />
        )}

        <ConfirmDialog
          isOpen={isNoPaymentConfirmOpen}
          onClose={() => setIsNoPaymentConfirmOpen(false)}
          onConfirm={handleConfirmNoPayment}
          title="No payment required"
          description="This transaction's total is zero or negative. No payment is required. Confirm to complete the transaction and create the order."
          confirmText="Complete Order"
          cancelText="Cancel"
          confirmVariant="primary"
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}

export default POSPage;
