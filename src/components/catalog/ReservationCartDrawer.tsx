import React, { useState } from "react";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Drawer from "../common/Drawer";
import Icon from "../common/Icons";

export interface CartItem {
  material: Material;
  orderType: "rent" | "buy";
  quantity: number;
  rentalDays: number;
}

interface ReservationCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (materialId: string, orderType: "rent" | "buy", delta: number) => void;
  onUpdateDays: (materialId: string, days: number) => void;
  onRemoveItem: (materialId: string, orderType: "rent" | "buy") => void;
  onClearCart: () => void;
}

export const ReservationCartDrawer: React.FC<ReservationCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onUpdateDays,
  onRemoveItem,
  onClearCart,
}) => {
  const { customers, createRentalReservation, createSalesOrder, showToast } = useApp();

  const [customerName, setCustomerName] = useState("Aurora Technologies Corp");
  const [customerPhone, setCustomerPhone] = useState("+1 (555) 0184-392");
  const [customerEmail, setCustomerEmail] = useState("events@auroratech.com");
  const [deliveryType, setDeliveryType] = useState<"Delivery & Collection" | "Customer Pickup">("Delivery & Collection");
  const [deliveryAddress, setDeliveryAddress] = useState("Grand Pavilion, 400 Waterfront Way");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10) + "T09:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Totals calculation
  const subtotal = items.reduce((sum, item) => {
    if (item.orderType === "rent") {
      return sum + item.material.rentalPriceDaily * item.rentalDays * item.quantity;
    }
    return sum + item.material.sellingPrice * item.quantity;
  }, 0);

  const estimatedTax = subtotal * 0.085;
  const depositTotal = items
    .filter((i) => i.orderType === "rent")
    .reduce((sum, item) => sum + Math.min(item.material.replacementValue * 0.3 * item.quantity, 1500), 0);
  const totalAmount = subtotal + estimatedTax;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    try {
      // Find or link customer
      const matchedCustomer = customers.find(
        (c) => c.name.toLowerCase() === customerName.toLowerCase()
      ) || customers[0];

      // Process Rentals
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
          responsibleEmployee: "Online Client Portal",
          warehouse: "Central Warehouse",
          notes: "Generated from Client Equipment Rental Portal",
          isOverdue: false,
        });
      }

      // Process Direct Purchases
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
          notes: "Direct equipment purchase order via portal",
        });
      }

      showToast("Order & Reservation submitted successfully! Synchronized with warehouse.");
      onClearCart();
      onClose();
    } catch {
      showToast("Error creating booking. Please verify details.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Equipment Reservation & Order Cart"
      subtitle={`${items.length} item(s) selected for rental or purchase`}
      badge="Client Portal"
      width="xl"
    >
      {items.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Icon name="cart" size={24} />
          </div>
          <strong className="text-sm font-bold text-gray-900 font-display block">Your cart is empty</strong>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Browse our equipment, tools, and materials catalog to add items for rental or purchase.
          </p>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="space-y-6">
          {/* Items List */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Selected Equipment & Tools
            </span>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={`${item.material.id}-${item.orderType}`}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center gap-3 text-xs"
                >
                  <img
                    src={item.material.imageUrl}
                    alt={item.material.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-gray-900 block truncate">{item.material.name}</strong>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                          item.orderType === "rent"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-blue-100 text-blue-900"
                        }`}
                      >
                        {item.orderType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-500 text-[11px] mt-1">
                      <span>
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
                            className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                          >
                            <option value={1}>1 Day</option>
                            <option value={2}>2 Days</option>
                            <option value={3}>3 Days</option>
                            <option value={5}>5 Days</option>
                            <option value={7}>1 Week (7d)</option>
                            <option value={14}>2 Weeks (14d)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.material.id, item.orderType, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-gray-900 text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.material.physicallyAvailable}
                      onClick={() => onUpdateQuantity(item.material.id, item.orderType, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.material.id, item.orderType)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Delivery Form */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Client & Handover Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Company / Client Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Rental Start Date</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Dispatch / Handover Type</label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs font-semibold"
                >
                  <option value="Delivery & Collection">Delivery & Collection by DOQA EVENTS Logistics</option>
                  <option value="Customer Pickup">Customer Depot Pickup (Central Warehouse)</option>
                </select>
              </div>

              {deliveryType === "Delivery & Collection" && (
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Delivery Site / Venue Address</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
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
              <span>Total Payable</span>
              <span className="text-base text-emerald-950 font-display">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Icon name="check" size={16} className="text-amber-400" />
            <span>Confirm Equipment Reservation & Order</span>
          </button>
        </form>
      )}
    </Drawer>
  );
};

export default ReservationCartDrawer;
