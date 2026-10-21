import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Material } from "../../types";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import EquipmentCard from "./EquipmentCard";
import RentalCalendar from "../rentals/RentalCalendar";
import { getMaterialDeal, curatedDealOverrides } from "../../utils/deals";

interface ProductDetailPageProps {
  onAddToCart: (material: Material, type: "rent" | "buy", days?: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, materials, showToast } = useApp();

  const material = materials.find((m) => m.id === id);

  const [rentalDays, setRentalDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10) + "T09:00"
  );

  if (!material) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
          <Icon name="alert" size={30} />
        </div>
        <h2 className="text-xl font-bold font-display text-gray-900">Equipment item not found</h2>
        <p className="text-xs text-gray-500">The requested equipment or tool could not be located in the fleet catalog.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-emerald-950 text-white rounded-xl text-xs font-bold">
          ← Return to Fleet Catalog
        </Link>
      </div>
    );
  }

  const isAvailable = material.physicallyAvailable > 0;
  const isLowStock = material.physicallyAvailable <= material.lowStockThreshold && isAvailable;

  // Deal check & calculations
  const isDeal = Boolean(material.isSpecialDeal || material.originalPriceETB || curatedDealOverrides[material.id]);
  const deal = isDeal ? getMaterialDeal(material) : null;
  const effectiveDailyRate = deal ? deal.discountedPrice : material.rentalPriceDaily;
  const currencySymbol = deal ? `${deal.currency} ` : "$";

  // Pricing calculations
  const rentalTotal = effectiveDailyRate * rentalDays;
  const securityDeposit = Math.min((deal ? deal.originalPrice * 0.2 : material.replacementValue * 0.3), 1500);

  // Material item prepared with deal daily rate if applicable
  const materialForCart = deal ? { ...material, rentalPriceDaily: deal.discountedPrice } : material;

  // Related equipment from same category
  const relatedEquipment = materials
    .filter((m) => m.category === material.category && m.id !== material.id && !m.isArchived)
    .slice(0, 3);

  const handleBookNow = () => {
    if (!isAvailable) return;
    onAddToCart(materialForCart, "rent", rentalDays);
  };

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-semibold" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-emerald-950 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/" className="hover:text-emerald-950 transition-colors">{material.category}</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{material.name}</span>
      </nav>

      {/* Main Dual-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Gallery & Live Depot Badge */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
            <img
              src={material.imageUrl}
              alt={material.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="px-3 py-1 bg-white/95 backdrop-blur-xs font-bold text-xs uppercase tracking-wider text-gray-900 rounded-full border border-gray-200 shadow-xs self-start">
                {material.category}
              </span>
              {deal && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-md animate-pulse border border-rose-500/80 self-start">
                  <Icon name="tag" size={13} className="text-amber-300" />
                  <span>{deal.discountPercent}% OFF SPECIAL DEAL</span>
                </span>
              )}
            </div>
            <div className="absolute top-4 right-4">
              <Badge tone={isAvailable ? (isLowStock ? "amber" : "green") : "red"}>
                {isAvailable ? `${material.physicallyAvailable} Units Available` : "Out of Stock"}
              </Badge>
            </div>
          </div>

          {/* Depot & Tracking Summary Box */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Depot Location</span>
              <strong className="text-gray-900 block truncate">{material.warehouse}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Storage Bay</span>
              <strong className="text-gray-900 block">{material.storageLocation}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Tracking Type</span>
              <strong className="text-gray-900 block">
                {material.isIndividuallyTracked ? "Serialized / Barcode" : "Bulk Fleet"}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Details, Pricing Matrix & Order Flow */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <span>{material.brand}</span>
              <span>•</span>
              <span>Model: {material.model}</span>
              <span>•</span>
              <span className="font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                {material.code}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black font-display text-gray-950 tracking-tight leading-tight">
              {material.name}
            </h1>

            <p className="text-xs md:text-sm text-gray-600 leading-relaxed pt-1">
              {material.description}
            </p>
          </div>

          {/* Rental Reservation Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold">
              <Icon name="calendar" size={15} className="text-emerald-700" />
              <span>Event Equipment Rental Reservation</span>
            </div>

            {/* Rental Options Form */}
            <div className="space-y-4 text-xs">
                {/* Rates Row */}
                {deal ? (
                  <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                          Special Deal Offer
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs">
                          <Icon name="tag" size={11} className="text-amber-300" />
                          {deal.discountPercent}% OFF
                        </span>
                      </div>
                      <span className="text-xs font-bold text-rose-700">
                        Save {deal.savingsAmount.toLocaleString()} {deal.currency}/day
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm font-semibold text-gray-400 line-through decoration-rose-500 decoration-2">
                          {deal.originalPrice.toLocaleString()} {deal.currency}
                        </span>
                        <strong className="text-3xl font-black text-rose-600 font-display">
                          {deal.discountedPrice.toLocaleString()} {deal.currency}
                          <span className="text-xs font-normal text-gray-500"> / day</span>
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Weekly Deal Rate
                        </span>
                        <strong className="text-sm font-bold text-gray-800">
                          {(deal.discountedPrice * 6).toLocaleString()} {deal.currency}
                          <span className="text-[10px] font-normal text-gray-500"> / wk</span>
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Standard Daily Rate
                      </span>
                      <strong className="text-2xl font-black text-emerald-950 font-display">
                        ${material.rentalPriceDaily}
                        <span className="text-xs font-normal text-gray-500"> / day</span>
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Weekly Discount Rate
                      </span>
                      <strong className="text-sm font-bold text-emerald-900">
                        ${material.rentalPriceWeekly}
                        <span className="text-[10px] font-normal text-gray-500"> / week</span>
                      </strong>
                    </div>
                  </div>
                )}

                {/* Duration & Start Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Select Rental Duration</label>
                    <select
                      value={rentalDays}
                      onChange={(e) => setRentalDays(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs font-semibold outline-none"
                    >
                      <option value={1}>1 Day (24 Hours)</option>
                      <option value={2}>2 Days (48 Hours)</option>
                      <option value={3}>3 Days (Standard Project)</option>
                      <option value={5}>5 Days (Work Week)</option>
                      <option value={7}>1 Full Week (7 Days - Save 20%)</option>
                      <option value={14}>2 Weeks (14 Days)</option>
                      <option value={30}>1 Month (30 Days - Contract Rate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Required Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Rental Subtotal ({rentalDays} days @ {deal ? `${deal.discountedPrice.toLocaleString()} ${deal.currency}` : `$${material.rentalPriceDaily}`}/day):
                    </span>
                    <strong className="text-gray-900 font-bold">
                      {deal ? `${rentalTotal.toLocaleString()} ${deal.currency}` : `$${rentalTotal.toFixed(2)}`}
                    </strong>
                  </div>
                  {deal && (
                    <div className="flex justify-between text-rose-700 font-semibold text-[11px]">
                      <span>Deal Discount Savings:</span>
                      <strong>-{(deal.savingsAmount * rentalDays).toLocaleString()} {deal.currency}</strong>
                    </div>
                  )}
                  <div className="flex justify-between text-amber-900">
                    <span>Refundable Deposit (Returned upon inspection):</span>
                    <strong className="font-bold">
                      {deal ? `${securityDeposit.toLocaleString()} ${deal.currency}` : `$${securityDeposit.toFixed(2)}`}
                    </strong>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    disabled={!isAvailable}
                    onClick={() => {
                      onAddToCart(materialForCart, "rent", rentalDays);
                      showToast(`Added ${material.name} (${rentalDays} days) to reservation cart.`);
                    }}
                    className="py-3 px-4 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Icon name="calendar" size={15} className="text-amber-400" />
                    <span>Add to Rental Cart</span>
                  </button>

                  <button
                    disabled={!isAvailable}
                    onClick={() => {
                      onAddToCart(materialForCart, "rent", rentalDays);
                      navigate("/");
                    }}
                    className="py-3 px-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-40"
                  >
                    Instant Reserve & Checkout
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Live Booking & Availability Calendar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
              LIVE EQUIPMENT CALENDAR
            </span>
            <h3 className="text-xl font-black font-display text-gray-950">
              Live Bookings & Availability Schedule for {material.name}
            </h3>
            <p className="text-xs text-gray-500">
              Check booked event dates, customer reservations, and open rental windows for this {material.category.toLowerCase()} equipment.
            </p>
          </div>
          {currentUser.role === "admin" && (
            <Link
              to="/calendar"
              className="text-xs font-bold text-emerald-950 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Full Fleet Calendar</span>
              <span>→</span>
            </Link>
          )}
        </div>

        <RentalCalendar
          preselectedMaterialId={material.id}
          preselectedCategory={material.category}
          hideHeaderStats={false}
        />
      </section>

      {/* Technical Specifications Matrix */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold font-display text-gray-900 uppercase tracking-wider">
          Technical Specifications & Operational Profile
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">SKU / Item Code</span>
            <strong className="text-gray-900 font-mono text-sm block mt-1">{material.code}</strong>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Equipment Category</span>
            <strong className="text-gray-900 text-sm block mt-1">{material.category}</strong>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Certified Supplier</span>
            <strong className="text-gray-900 text-sm block mt-1 truncate">{material.supplierName}</strong>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Commercial Warranty</span>
            <strong className="text-gray-900 text-sm block mt-1 truncate">{material.warrantyInfo}</strong>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Replacement Valuation</span>
            <strong className="text-gray-900 text-sm block mt-1">${material.replacementValue.toLocaleString()}</strong>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Fleet Owned</span>
            <strong className="text-gray-900 text-sm block mt-1">{material.totalOwned} {material.unitOfMeasure}</strong>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Currently Rented Out</span>
            <strong className="text-gray-900 text-sm block mt-1">{material.rentedOut} units</strong>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Physical Condition</span>
            <strong className="text-emerald-800 text-sm block mt-1">{material.physicalCondition}</strong>
          </div>
        </div>
      </section>

      {/* Related Category Equipment */}
      {relatedEquipment.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-gray-900">
              Related Gear in {material.category}
            </h3>
            <Link to="/" className="text-xs font-bold text-emerald-950 hover:underline">
              View all fleet →
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEquipment.map((rel) => (
              <EquipmentCard key={rel.id} material={rel} onAddToCart={onAddToCart} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
