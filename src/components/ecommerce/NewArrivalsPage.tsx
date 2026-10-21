import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Material } from "../../types";
import EquipmentCard from "./EquipmentCard";

interface NewArrivalsPageProps {
  onAddToCart: (material: Material, type: "rent" | "buy", days?: number) => void;
}

export const NewArrivalsPage: React.FC<NewArrivalsPageProps> = ({ onAddToCart }) => {
  const { materials } = useApp();

  // Sort by purchaseDate descending (newest additions)
  const newArrivals = [...materials]
    .filter((m) => !m.isArchived)
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-[#123d32] text-white rounded-3xl p-5 sm:p-8 md:p-10 shadow-lg space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block">
          Latest Additions
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-white">
          New Fleet Arrivals & Modern Equipment
        </h1>
        <p className="text-xs md:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
          Recently acquired high-spec LED video walls, marquee structures, intelligent moving lights, concert line arrays, and luxury banquet decor ready for rental and event dispatch.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200 gap-2">
        <span>Showing {newArrivals.length} new additions</span>
        <Link to="/" className="text-[#123d32] hover:underline font-bold">
          ← Back to All Equipment
        </Link>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {newArrivals.map((material) => (
          <EquipmentCard key={material.id} material={material} onAddToCart={onAddToCart} />
        ))}
      </ul>
    </div>
  );
};

export default NewArrivalsPage;
