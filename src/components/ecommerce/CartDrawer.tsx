import React, { useState } from "react";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";

export interface CartItem {
  material: Material;
  orderType: "rent" | "buy";
  quantity: number;
  rentalDays: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (materialId: string, orderType: "rent" | "buy", delta: number) => void;
  onUpdateDays: (materialId: string, days: number) => void;
  onRemoveItem: (materialId: string, orderType: "rent" | "buy") => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onUpdateDays,
  onRemoveItem,
  onClearCart,
}) => {
  const { customers, createRentalReservation, createSalesOrder, showToast } = useApp();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout">("cart");
  const [customerName, setCustomerName] = useState("Aurora Technologies Corp");
  const [customerPhone, setCustomerPhone] = useState("+1 (555) 0184-392");
  const [customerEmail, setCustomerEmail] = useState("events@auroratech.com");
  const [deliveryType, setDeliveryType] = useState<"Delivery & Collection" | "Customer Pickup">("Delivery & Collection");
  const [deliveryAddress, setDeliveryAddress] = useState("Grand Pavilion, 400 Waterfront Way");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10) + "T08:30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Totals calculations
  const subtotal = items.reduce((sum, item) => {
    if (item.orderType === "rent") {
      return sum + item.material.rentalPriceDaily * item.rentalDays * item.quantity;
    }
    return sum + item.material.sellingPrice * item.quantity;
  }, 0);

  const estimatedTax = subtotal * 0.085;
  const depositTotal = items
    .filter((i) => i.orderType === "rent")
    .reduce((sum, item) => sum + Math.min(item.material.replacementValue * 0.25 * item.quantity, 1500), 0);
  const totalAmount = subtotal + estimatedTax;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    try {
      const matchedCustomer =
        customers.find((c) => c.name.toLowerCase() === customerName.toLowerCase()) || customers[0];

      // 1. Process Rentals
      const rentalItems = items.filter((i) => i.orderType === "rent");
      if (rentalItems.length > 0) {
        const maxDays = Math.max(...rentalItems.map((i) => i.rentalDays), 1);
        const endDateObj = new Date(new Date(startDate).getTime() + maxDays * 86400000);
        const expectedReturnDate = endDateObj.toISOString().slice(0, 16);

        createRentalReservation({
          customerId: matchedCustomer.id,
          customerName: customerName || matchedCustomer.name,
          customerPhone: customerPhone || matchedCustomer.phone,
          customerEmail: customerEmail || matchedCustomer.email,
          startDate,
          expectedReturnDate,
          rentalDurationDays: maxDays,
          items: rentalItems.map((i) => ({
            materialId: i.material.id,
            materialCode: i.material.code,
            materialName: i.material.name,
            category: i.material.category,
            quantity: i.quantity,
            dailyRate: i.material.rentalPriceDaily,
            totalDays: i.rentalDays,
            lineTotal: i.material.rentalPriceDaily * i.rentalDays * i.quantity,
            returnedQuantity: 0,
            missingQuantity: 0,
            damagedQuantity: 0,
          })),
          subtotal: rentalItems.reduce((acc, i) => acc + i.material.rentalPriceDaily * i.rentalDays * i.quantity, 0),
          taxAmount: estimatedTax,
          discountAmount: 0,
          totalCost: totalAmount,
          depositAmount: depositTotal,
          depositStatus: "Held",
          paymentStatus: "Paid",
          amountPaid: totalAmount,
          outstandingBalance: 0,
          status: "Confirmed",
          deliveryType,
          deliveryAddress: deliveryType === "Delivery & Collection" ? deliveryAddress : undefined,
          responsibleEmployee: "Online E-Commerce Client",
          warehouse: "Central Warehouse",
          notes: "Booked via E-Commerce Rental Storefront",
          isOverdue: false,
        });
      }

      // 2. Process Direct Sales
      const purchaseItems = items.filter((i) => i.orderType === "buy");
      if (purchaseItems.length > 0) {
        const purchaseSubtotal = purchaseItems.reduce(
          (acc, i) => acc + i.material.sellingPrice * i.quantity,
          0
        );
        const purchaseProfit = purchaseItems.reduce(
          (acc, i) => acc + (i.material.sellingPrice - i.material.purchaseCost) * i.quantity,
          0
        );

        createSalesOrder({
          customerId: matchedCustomer.id,
          customerName: customerName || matchedCustomer.name,
          items: purchaseItems.map((i) => ({
            materialId: i.material.id,
            materialName: i.material.name,
            materialCode: i.material.code,
            quantity: i.quantity,
            unitPrice: i.material.sellingPrice,
            purchaseCost: i.material.purchaseCost,
            lineTotal: i.material.sellingPrice * i.quantity,
          })),
          subtotal: purchaseSubtotal,
          discount: 0,
          tax: purchaseSubtotal * 0.085,
          totalAmount: purchaseSubtotal * 1.085,
          grossProfit: purchaseProfit,
          paymentStatus: "Paid",
          paymentMethod: "Bank Transfer",
          amountPaid: purchaseSubtotal * 1.085,
          orderStatus: "Confirmed",
          orderDate: new Date().toISOString().slice(0, 10),
          notes: "Equipment purchase order placed via e-commerce storefront",
        });
      }

      showToast("Order & Reservation placed successfully! Synchronized with DOQA EVENTS logistics.");
      onClearCart();
      setCheckoutStep("cart");
      onClose();
    } catch {
      showToast("Could not complete booking. Please verify details.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-emerald-950/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 transform transition-transform animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 via-white to-amber-50/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                {checkoutStep === "cart" ? "E-Commerce Cart" : "Checkout Details"}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 font-semibold">{items.length} items</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 font-display mt-1">
              {checkoutStep === "cart" ? "Your Reservation & Order" : "Confirm Delivery & Handover"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close drawer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Icon name="cart" size={28} />
              </div>
              <strong className="text-base font-bold text-gray-900 font-display block">Your cart is empty</strong>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore our marquee tents, concert sound systems, LED video walls, seating, and banquet materials to begin your event rental reservation.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-[#123d32] text-white rounded-xl text-xs font-bold hover:bg-[#1a4a3e]"
              >
                Start Browsing
              </button>
            </div>
          ) : checkoutStep === "cart" ? (
            <div className="space-y-4">
              {/* Cart Items */}
              {items.map((item) => (
                <div
                  key={`${item.material.id}-${item.orderType}`}
                  className="p-3 sm:p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-2.5 sm:gap-3.5 text-xs"
                >
                  <img
                    src={item.material.imageUrl}
                    alt={item.material.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover bg-gray-200 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-gray-900 block truncate font-bold text-xs">{item.material.name}</strong>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                          item.orderType === "rent" ? "bg-emerald-100 text-emerald-950" : "bg-blue-100 text-blue-950"
                        }`}
                      >
                        {item.orderType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-gray-600 text-[11px] mt-1">
                      <span className="font-semibold text-emerald-950">
                        {item.orderType === "rent"
                          ? `$${item.material.rentalPriceDaily}/day`
                          : `$${item.material.sellingPrice}`}
                      </span>

                      {item.orderType === "rent" && (
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] text-gray-400">Duration:</label>
                          <select
                            value={item.rentalDays}
                            onChange={(e) => onUpdateDays(item.material.id, parseInt(e.target.value) || 1)}
                            className="bg-white border border-gray-200 rounded px-1 py-0.5 text-[10px] font-semibold outline-none"
                          >
                            <option value={1}>1 Day</option>
                            <option value={2}>2 Days</option>
                            <option value={3}>3 Days</option>
                            <option value={5}>5 Days</option>
                            <option value={7}>1 Week</option>
                            <option value={14}>2 Weeks</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-white border border-gray-200 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.material.id, item.orderType, -1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-4 sm:w-5 text-center font-bold text-gray-900 text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.material.physicallyAvailable}
                      onClick={() => onUpdateQuantity(item.material.id, item.orderType, 1)}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-xs disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.material.id, item.orderType)}
                    className="p-1 sm:p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors shrink-0"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Checkout Form Step */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Contractor / Client Profile
                </span>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Company / Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">Billing Email</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Rental Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Handover Mode</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs font-semibold outline-none"
                  >
                    <option value="Delivery & Collection">Delivery & Collection by DOQA EVENTS Logistics</option>
                    <option value="Customer Pickup">Depot Pickup (Central Warehouse Yard)</option>
                  </select>
                </div>

                {deliveryType === "Delivery & Collection" && (
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 block mb-1">Site Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer Pricing Summary & Actions */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50/80 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (8.5%)</span>
                <span className="font-semibold text-gray-900">${estimatedTax.toFixed(2)}</span>
              </div>
              {depositTotal > 0 && (
                <div className="flex justify-between text-amber-900">
                  <span>Refundable Security Deposit</span>
                  <span className="font-bold">${depositTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-base text-[#123d32] font-display font-black">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {checkoutStep === "cart" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="py-2.5 px-3 border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold"
                >
                  Clear Cart
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep("checkout")}
                  className="py-2.5 px-3 bg-[#123d32] hover:bg-[#1a4a3e] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Checkout</span>
                  <Icon name="arrow" size={13} className="text-amber-400" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("cart")}
                  className="py-2.5 px-3 border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  ← Back to Cart
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="py-2.5 px-3 bg-[#123d32] hover:bg-[#1a4a3e] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Icon name="check" size={14} className="text-amber-400" />
                  <span>Confirm Booking</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
