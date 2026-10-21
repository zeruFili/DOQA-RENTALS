import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Material } from "../../types";
import EquipmentCard from "./EquipmentCard";
import Icon from "../common/Icons";
import { getMaterialDeal, DealInfo } from "../../utils/deals";

interface DiscountPageProps {
  onAddToCart: (material: Material, type: "rent" | "buy", days?: number) => void;
}

export const DiscountPage: React.FC<DiscountPageProps> = ({ onAddToCart }) => {
  const { materials } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<"discount-desc" | "savings-desc" | "price-asc" | "price-desc">("discount-desc");

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

  // Enrich all non-archived materials with accurate deal data
  const dealsList = useMemo(() => {
    return materials
      .filter((m) => !m.isArchived)
      .map((material) => ({
        material,
        deal: getMaterialDeal(material),
      }));
  }, [materials]);

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    return dealsList
      .filter(({ material, deal }) => {
        // Category filter
        if (selectedCategory !== "All" && material.category !== selectedCategory) {
          return false;
        }

        // Discount tier filter
        if (selectedTier === "30" && deal.discountPercent < 30) return false;
        if (selectedTier === "25" && (deal.discountPercent < 25 || deal.discountPercent >= 30)) return false;
        if (selectedTier === "20" && deal.discountPercent !== 20) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            material.name.toLowerCase().includes(q) ||
            material.description.toLowerCase().includes(q) ||
            material.category.toLowerCase().includes(q) ||
            material.brand.toLowerCase().includes(q) ||
            material.code.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortKey === "discount-desc") {
          return b.deal.discountPercent - a.deal.discountPercent;
        }
        if (sortKey === "savings-desc") {
          return b.deal.savingsAmount - a.deal.savingsAmount;
        }
        if (sortKey === "price-asc") {
          return a.deal.discountedPrice - b.deal.discountedPrice;
        }
        if (sortKey === "price-desc") {
          return b.deal.discountedPrice - a.deal.discountedPrice;
        }
        return 0;
      });
  }, [dealsList, selectedCategory, selectedTier, searchQuery, sortKey]);

  return (
    <div className="space-y-8">
      {/* Deals Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#123d32] via-[#1a4a3e] to-rose-950 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-rose-900/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/30 border border-rose-400/40 text-rose-200 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>DOQA EVENTS • DEALS & SPECIAL OFFERS</span>
            <span>•</span>
            <span>UP TO 30% OFF</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Exclusive Deals & Discounted Rental Fleet
          </h1>

          <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            Take advantage of special contract rates and promotional discounts on premium event equipment. Every deal displays the original price with a strikethrough line, the discounted rate in <strong>ETB</strong>, and your exact savings.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-amber-400 font-bold">✓</span>
              <span>Strikethrough Original Pricing</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-amber-400 font-bold">✓</span>
              <span>Accurate Mathematical % OFF</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-amber-400 font-bold">✓</span>
              <span>All Rates Quoted in ETB</span>
            </div>
          </div>
        </div>

        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        {/* Top Row: Search and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Icon name="search" size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discounted event gear, marquee tents, line arrays, chairs..."
              className="w-full text-xs font-medium pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort By:</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white text-gray-800 outline-none"
            >
              <option value="discount-desc">Highest Discount %</option>
              <option value="savings-desc">Biggest Savings (ETB)</option>
              <option value="price-asc">Discounted Price: Low to High</option>
              <option value="price-desc">Discounted Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Discount Tier Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Discount Tier:
          </span>
          {[
            { id: "All", label: "All Special Offers", badge: `${dealsList.length}` },
            { id: "30", label: "🔥 30% OFF Mega Deals", badge: `${dealsList.filter((d) => d.deal.discountPercent >= 30).length}` },
            { id: "25", label: "⚡ 25% OFF Big Savings", badge: `${dealsList.filter((d) => d.deal.discountPercent === 25).length}` },
            { id: "20", label: "✨ 20% OFF Popular Deals", badge: `${dealsList.filter((d) => d.deal.discountPercent === 20).length}` },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedTier === tier.id
                  ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <span>{tier.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedTier === tier.id ? "bg-white/20 text-white" : "bg-white text-gray-500"
              }`}>
                {tier.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Category Scroll Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-gray-100 pt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#123d32] text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span>Showing <strong>{filteredDeals.length}</strong> special offer items</span>
          {selectedCategory !== "All" && (
            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px] border border-emerald-200">
              {selectedCategory}
            </span>
          )}
          {selectedTier !== "All" && (
            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold text-[11px] border border-rose-200">
              {selectedTier}% OFF Tier
            </span>
          )}
        </div>
        <Link to="/" className="text-[#123d32] hover:underline font-bold flex items-center gap-1">
          <span>← Back to Full Fleet</span>
        </Link>
      </div>

      {/* Deals Product Cards Grid */}
      {filteredDeals.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDeals.map(({ material, deal }) => (
            <EquipmentCard
              key={material.id}
              material={material}
              onAddToCart={onAddToCart}
              deal={deal}
            />
          ))}
        </ul>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            🏷️
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-display">No Deals Found for Current Filters</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            There are currently no items matching your filter criteria. Try clearing the filters to view all active event rental deals.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedTier("All");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscountPage;
