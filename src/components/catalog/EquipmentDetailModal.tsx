import React from "react";
import { Material } from "../../types";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import Icon from "../common/Icons";

interface EquipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  onAddToCart: (material: Material, type: "rent" | "buy", days?: number) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  isOpen,
  onClose,
  material,
  onAddToCart,
}) => {
  if (!material) return null;

  const isLowStock = material.physicallyAvailable <= material.lowStockThreshold;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={material.name}
      subtitle={`${material.brand} • ${material.model} • Code: ${material.code}`}
      badge={material.category}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Media & Key Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
            <img
              src={material.imageUrl}
              alt={material.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              <Badge tone={material.physicallyAvailable > 0 ? "green" : "red"}>
                {material.physicallyAvailable > 0
                  ? `${material.physicallyAvailable} In Stock`
                  : "Out of Stock"}
              </Badge>
              {isLowStock && material.physicallyAvailable > 0 && (
                <Badge tone="amber">Low Stock</Badge>
              )}
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Overview & Description
              </span>
              <p className="text-xs text-gray-700 leading-relaxed mt-1">
                {material.description}
              </p>
            </div>

            {/* Pricing Matrix */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-600">Daily Rental Rate</span>
                <span className="text-base font-bold text-emerald-950 font-display">
                  ${material.rentalPriceDaily.toFixed(2)}
                  <span className="text-[10px] text-gray-500 font-normal"> / day</span>
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-600">Weekly Rental Rate</span>
                <span className="text-sm font-bold text-emerald-800 font-display">
                  ${material.rentalPriceWeekly.toFixed(2)}
                  <span className="text-[10px] text-gray-500 font-normal"> / week</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Security Deposit</span>
                <span className="text-sm font-bold text-gray-900 font-display">
                  ${material.depositAmount ?? Math.round(material.rentalPriceDaily * 1.5)}
                  <span className="text-[10px] text-emerald-700 font-medium ml-1">100% Refundable</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2">
              <button
                disabled={material.physicallyAvailable <= 0}
                onClick={() => {
                  onAddToCart(material, "rent", 3);
                  onClose();
                }}
                className="w-full py-2.5 px-3 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icon name="calendar" size={14} className="text-amber-400" />
                Reserve Rental Equipment
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Technical Specifications Table */}
        <div className="border-t border-gray-100 pt-4">
          <strong className="text-xs font-bold text-gray-900 block mb-3 font-display">
            Technical Specifications & Asset Profile
          </strong>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Warehouse</span>
              <strong className="text-gray-900 font-medium block truncate mt-0.5">{material.warehouse}</strong>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Storage Bay</span>
              <strong className="text-gray-900 font-medium block truncate mt-0.5">{material.storageLocation}</strong>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Replacement Value</span>
              <strong className="text-gray-900 font-medium block mt-0.5">${material.replacementValue.toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Tracking Mode</span>
              <strong className="text-gray-900 font-medium block mt-0.5">
                {material.isIndividuallyTracked ? "Serialized / Barcode" : "Bulk Batch"}
              </strong>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Supplier</span>
              <strong className="text-gray-900 font-medium block truncate mt-0.5">{material.supplierName}</strong>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Warranty</span>
              <strong className="text-gray-900 font-medium block truncate mt-0.5">{material.warrantyInfo}</strong>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Total Owned</span>
              <strong className="text-gray-900 font-medium block mt-0.5">{material.totalOwned} {material.unitOfMeasure}</strong>
            </div>
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Safety Threshold</span>
              <strong className="text-gray-900 font-medium block mt-0.5">{material.lowStockThreshold} units</strong>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EquipmentDetailModal;
