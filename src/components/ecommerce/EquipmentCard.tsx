import React from "react";
import { Link } from "react-router-dom";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import { DealInfo } from "../../utils/deals";

interface EquipmentCardProps {
  material: Material;
  onAddToCart: (material: Material, type: "rent" | "buy", days?: number) => void;
  deal?: DealInfo;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ material, onAddToCart, deal }) => {
  const { openRentalModal } = useApp();
  const isAvailable = material.physicallyAvailable > 0;
  const isLowStock = material.physicallyAvailable <= material.lowStockThreshold && isAvailable;

  return (
    <li className="list-none">
      <article className="h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col group">
        {/* Media Thumbnail with Badges */}
        <Link
          to={`/product/${material.id}`}
          className="relative aspect-4/3 bg-gray-100 overflow-hidden block"
        >
          <img
            src={material.imageUrl}
            alt={material.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-gray-800 px-2.5 py-0.5 rounded-full border border-gray-200 shadow-2xs self-start">
              {material.category}
            </span>
            {deal && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-1 rounded-full shadow-md self-start border border-rose-500/80 animate-pulse">
                <Icon name="tag" size={11} className="text-amber-300" />
                <span>{deal.discountPercent}% OFF</span>
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <Badge tone={isAvailable ? (isLowStock ? "amber" : "green") : "red"} size="sm">
              {isAvailable ? `${material.physicallyAvailable} Ready` : "Out of Stock"}
            </Badge>
          </div>

          {/* Location Badge */}
          <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-semibold bg-[#123d32]/90 text-white px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
              <Icon name="mapPin" size={10} />
              {material.storageLocation} ({material.warehouse.split(" ")[0]})
            </span>
          </div>
        </Link>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
              <span className="truncate">{material.brand} • {material.model}</span>
              <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                {material.code}
              </span>
            </div>

            <Link
              to={`/product/${material.id}`}
              className="text-sm font-bold text-gray-900 group-hover:text-emerald-900 transition-colors line-clamp-2 font-display block leading-snug"
            >
              {material.name}
            </Link>

            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {material.description}
            </p>
          </div>

          {/* Pricing & Cart Action Section */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            {deal ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Special Deal Rate</span>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-black">
                    {deal.discountPercent}% OFF
                  </span>
                </div>

                {/* Strikethrough Original Price & Prominent Discounted Price */}
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-semibold text-gray-400 line-through">
                    {deal.originalPrice.toLocaleString()} {deal.currency}
                  </span>
                  <strong className="text-xl sm:text-2xl font-black text-rose-600 font-display">
                    {deal.discountedPrice.toLocaleString()} {deal.currency}
                    <span className="text-[10px] font-normal text-gray-500"> /day</span>
                  </strong>
                </div>

                {/* Savings Line */}
                <div className="flex items-center justify-between pt-1 border-t border-dashed border-gray-100 text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Icon name="check" size={12} className="text-emerald-600" />
                    Save {deal.savingsAmount.toLocaleString()} {deal.currency}
                  </span>
                  <span className="text-gray-400 text-[10px]">
                    Deposit: {material.depositAmount ?? Math.round(deal.discountedPrice * 1.5)} {deal.currency}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">
                    Daily Rental
                  </span>
                  <strong className="text-xl font-black text-[#123d32] font-display">
                    ${material.rentalPriceDaily}
                    <span className="text-[10px] font-normal text-gray-500"> /day</span>
                  </strong>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">
                    Weekly Rate
                  </span>
                  <strong className="text-sm font-bold text-emerald-800 font-display block mt-0.5">
                    ${material.rentalPriceWeekly}
                    <span className="text-[9px] font-normal text-gray-400"> /wk</span>
                  </strong>
                  <span className="text-[9px] text-gray-400">
                    Deposit: ${material.depositAmount ?? Math.round(material.rentalPriceDaily * 1.5)}
                  </span>
                </div>
              </div>
            )}

            {/* Direct Rental Action Button */}
            <div className="pt-0.5">
              <button
                disabled={!isAvailable}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openRentalModal(material, deal);
                }}
                className={`w-full py-2.5 px-3 text-white rounded-xl text-xs font-bold active:scale-98 transition-all shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  deal
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-900/10"
                    : "bg-[#123d32] hover:bg-[#1a4a3e]"
                }`}
                title="View equipment calendar & reserve"
              >
                <Icon name="calendar" size={14} className={deal ? "text-white" : "text-amber-400"} />
                <span>{deal ? "Rent Special Deal" : "Rent Equipment"}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
};

export default EquipmentCard;
