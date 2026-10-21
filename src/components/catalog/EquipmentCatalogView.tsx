import React, { useState, useMemo } from "react";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import EquipmentDetailModal from "./EquipmentDetailModal";

interface EquipmentCatalogViewProps {
  onAddToCart: (material: Material, type: "rent" | "buy", days?: number) => void;
  onOpenCart: () => void;
  cartCount: number;
}

export const EquipmentCatalogView: React.FC<EquipmentCatalogViewProps> = ({
  onAddToCart,
  onOpenCart,
  cartCount,
}) => {
  const { materials, showToast } = useApp();

  const [activeType, setActiveType] = useState<"all" | "available">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedMaterialForDetail, setSelectedMaterialForDetail] = useState<Material | null>(null);

  const categories = [
    "All",
    "Seating & Lounge Furniture",
    "Tables & Banquet Stations",
    "Structures, Tents & Canopies",
    "Staging, Truss & Rigging",
    "Audio & Sound Systems",
    "Lighting & Special FX",
    "Video, Screens & LED Displays",
    "Tableware, Glassware & Linens",
    "Decor, Florals & Backdrops",
    "Power Distribution & Climate",
    "Crowd Control & Exhibition Booths",
  ];

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      if (item.isArchived) return false;
      if (inStockOnly && item.physicallyAvailable <= 0) return false;
      if (activeType === "available" && item.physicallyAvailable <= 0) return false;
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;

      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [materials, inStockOnly, activeType, selectedCategory, search]);

  return (
    <div className="space-y-6">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#123d32] via-[#1a4a3e] to-[#0d2a23] text-white p-8 md:p-10 shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full inline-block">
            EVENT PRODUCTION & EQUIPMENT CATALOG
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white">
            Event Management Rentals & Production Equipment
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed">
            Professional fleet of marquee tents, P2.6 LED video walls, line array concert audio, wireless lighting, chiavari chairs, and VIP banquet decor for weddings, conferences, and festivals.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => {
                setSelectedCategory("Structures, Tents & Canopies");
                showToast("Filtered by Structures & Tents.");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
            >
              🎪 Structures & Tents
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Video, Screens & LED Displays");
                showToast("Filtered by LED Video Walls.");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
            >
              🖥️ Video & Screens
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Seating & Lounge Furniture");
                showToast("Filtered by Seating & Lounge.");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
            >
              🪑 Seating & Lounge
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Audio & Sound Systems");
                showToast("Filtered by Audio Systems.");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
            >
              🔊 Audio Systems
            </button>
          </div>
        </div>

        {/* Decorative Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        {/* Top Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Event Rental Fleet Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All Event Fleet" },
              { id: "available", label: "Ready to Dispatch" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeType === tab.id
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Stock Check */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Icon name="search" size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search equipment, tools, SKU..."
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-emerald-800 focus:ring-emerald-500"
              />
              <span>In-stock Only</span>
            </label>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-t border-gray-100 pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-900 text-white font-bold"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredMaterials.map((material) => {
          const isAvailable = material.physicallyAvailable > 0;
          const isLowStock = material.physicallyAvailable <= material.lowStockThreshold;

          return (
            <div
              key={material.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col group"
            >
              {/* Product Media */}
              <div
                onClick={() => setSelectedMaterialForDetail(material)}
                className="relative aspect-4/3 bg-gray-100 cursor-pointer overflow-hidden"
              >
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-gray-800 px-2 py-0.5 rounded-full border border-gray-200">
                    {material.category}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <Badge tone={isAvailable ? (isLowStock ? "amber" : "green") : "red"} size="sm">
                    {isAvailable ? `${material.physicallyAvailable} Avail` : "Out of Stock"}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div
                  onClick={() => setSelectedMaterialForDetail(material)}
                  className="cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                    <span>{material.brand}</span>
                    <span>•</span>
                    <span>{material.code}</span>
                  </div>
                  <strong className="text-sm font-bold text-gray-900 group-hover:text-emerald-900 transition-colors line-clamp-1 font-display">
                    {material.name}
                  </strong>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {material.description}
                  </p>
                </div>

                {/* Rates & Direct Action Buttons */}
                <div className="pt-2 border-t border-gray-100 space-y-2.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Daily Rate</span>
                      <strong className="text-base font-extrabold text-emerald-950 font-display">
                        ${material.rentalPriceDaily}
                        <span className="text-[10px] text-gray-500 font-normal"> / day</span>
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Weekly Rate</span>
                      <span className="text-xs font-bold text-emerald-800 font-display">
                        ${material.rentalPriceWeekly} / wk
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      disabled={!isAvailable}
                      onClick={() => onAddToCart(material, "rent", 3)}
                      className="w-full py-2 px-3 bg-emerald-950 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-2xs disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      <Icon name="calendar" size={13} className="text-amber-400" />
                      <span>Reserve for Rental</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Equipment Detail Modal */}
      <EquipmentDetailModal
        isOpen={Boolean(selectedMaterialForDetail)}
        onClose={() => setSelectedMaterialForDetail(null)}
        material={selectedMaterialForDetail}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default EquipmentCatalogView;
