import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import EquipmentCard from "./EquipmentCard";
import Icon from "../common/Icons";

interface ShopPageProps {
  onAddToCart: (material: Material, type: "rent" | "buy", days?: number) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onAddToCart }) => {
  const { materials } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<"featured" | "price-asc" | "price-desc" | "available">("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [selectedEventType, setSelectedEventType] = useState<string>("All");
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 12;

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

  const eventTypes = [
    { id: "All", label: "All Events", icon: "✨" },
    { id: "Weddings", label: "Weddings", icon: "💍", keywords: ["wedding", "banquet", "ceremony", "chiavari", "vow", "bride", "velvet", "candelabra", "arch", "flower", "clouds", "porcelain"] },
    { id: "Conferences", label: "Conferences", icon: "🏢", keywords: ["conference", "summit", "keynote", "podium", "presentation", "kiosk", "monitor", "booth", "registration", "mesh", "ptz"] },
    { id: "Concerts", label: "Concerts & Live", icon: "🎤", keywords: ["concert", "festival", "audio", "line array", "stage", "truss", "moving head", "sound", "barrier", "mojo", "dj", "fountain"] },
    { id: "Exhibitions", label: "Expos & Fairs", icon: "🏛️", keywords: ["exhibition", "expo", "shell scheme", "octanorm", "booth", "kiosk", "display", "brochure", "stanchion", "totem", "trade"] },
    { id: "Parties", label: "Parties & Galas", icon: "🎉", keywords: ["party", "gala", "bar", "cocktail", "led bar", "festoon", "spark", "cheers", "lounge", "leather", "sofa", "chill", "love"] },
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: materials.filter((m) => !m.isArchived).length };
    materials.forEach((m) => {
      if (!m.isArchived) {
        counts[m.category] = (counts[m.category] || 0) + 1;
      }
    });
    return counts;
  }, [materials]);

  // Filtered materials
  const filtered = useMemo(() => {
    return materials.filter((m) => {
      if (m.isArchived) return false;
      if (selectedCategory !== "All" && m.category !== selectedCategory) return false;
      if (inStockOnly && m.physicallyAvailable <= 0) return false;

      // Event Type Filter
      if (selectedEventType !== "All") {
        const ev = eventTypes.find((e) => e.id === selectedEventType);
        if (ev && ev.keywords) {
          const itemText = `${m.name} ${m.description} ${m.brand} ${m.category}`.toLowerCase();
          const matchesEvent = ev.keywords.some((kw) => itemText.includes(kw));
          if (!matchesEvent) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [materials, selectedCategory, inStockOnly, selectedEventType, searchQuery]);

  // Sorted materials
  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortKey === "price-asc") {
      list.sort((a, b) => a.rentalPriceDaily - b.rentalPriceDaily);
    } else if (sortKey === "price-desc") {
      list.sort((a, b) => b.rentalPriceDaily - a.rentalPriceDaily);
    } else if (sortKey === "available") {
      list.sort((a, b) => b.physicallyAvailable - a.physicallyAvailable);
    }
    return list;
  }, [filtered, sortKey]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE) || 1;
  const safePage = Math.min(page, totalPages);
  const pagedItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedEventType("All");
    setInStockOnly(false);
    setSearchQuery("");
    setSortKey("featured");
    setPage(1);
  };

  const tickerItems = [
    "💍 Luxury Gold Chiavari Ballroom Chairs",
    "🎪 40x80ft Clear-Span Pavilion Marquees",
    "🖥️ P2.6 4K Indoor High-Definition LED Video Walls",
    "🔊 10,000W Active Line Array Concert Sound Systems",
    "✨ Cold Spark Pyrotechnic Fountains",
    "☁️ Heavy Dry Ice Low-Lying Dancing on Clouds",
    "🍽️ 24k Titanium Gold Dinnerware & Crystal Glassware",
    "🌸 8x8ft 3D Faux Rose & Greenery Flower Walls",
    "🛡️ Heavy-Duty Mojo Front-of-Stage Crowd Barriers",
    "🔌 45kVA Ultra-Silenced Whisper Diesel Generators",
  ];

  return (
    <div className="space-y-8">
      {/* Category Ticker */}
      <div className="overflow-hidden bg-[#18352b]/5 py-2.5 border-y border-emerald-950/10">
        <div className="flex gap-8 whitespace-nowrap animate-slide-left text-xs font-bold text-emerald-950">
          {tickerItems.concat(tickerItems).map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span>{item}</span>
              <span className="text-emerald-700/40">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Showcase Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#123d32] via-[#1a4a3e] to-[#0e3027] text-white p-5 sm:p-8 md:p-12 shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <span>Event Management & Production Rentals</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Same-Day Dispatch & On-Site Setup</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Premium Event Materials & Equipment Rental
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-emerald-100/80 leading-relaxed max-w-2xl">
            Certified inventory curated exclusively for Weddings, Conferences, Concerts, Corporate Galas, Private Parties, and Exhibitions. Live stock verification, transparent daily & weekly rates, and rapid booking.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => {
                setSelectedCategory("Structures, Tents & Canopies");
                setSelectedEventType("All");
                setPage(1);
              }}
              className="px-3.5 py-2 bg-white text-emerald-950 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>🎪</span>
              <span>Marquees & Tents</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Video, Screens & LED Displays");
                setSelectedEventType("All");
                setPage(1);
              }}
              className="px-3.5 py-2 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-500/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>🖥️</span>
              <span>LED Video Walls</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Seating & Lounge Furniture");
                setSelectedEventType("All");
                setPage(1);
              }}
              className="px-3.5 py-2 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-500/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>🪑</span>
              <span>Seating & Lounges</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Audio & Sound Systems");
                setSelectedEventType("All");
                setPage(1);
              }}
              className="px-3.5 py-2 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-500/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>🔊</span>
              <span>Audio Systems</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Lighting & Special FX");
                setSelectedEventType("All");
                setPage(1);
              }}
              className="px-3.5 py-2 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-500/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>💡</span>
              <span>Lighting & Special FX</span>
            </button>
          </div>
        </div>

        {/* Ambient Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      </section>

      {/* Main Catalog Section: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:block ${
            mobileFiltersOpen
              ? "fixed inset-0 z-50 p-6 bg-white overflow-y-auto block"
              : "hidden"
          } lg:relative lg:p-0 lg:bg-transparent lg:z-0`}
        >
          {mobileFiltersOpen && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 lg:hidden">
              <strong className="text-base font-bold text-gray-900">Filter Equipment</strong>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          )}

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Filters</span>
              {(selectedCategory !== "All" || inStockOnly || searchQuery || selectedEventType !== "All") && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Keyword Search</label>
              <div className="relative">
                <Icon name="search" size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. chiavari, marquee, led wall..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Event Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Event Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {eventTypes.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setSelectedEventType(ev.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all text-left flex items-center gap-1.5 border ${
                      selectedEventType === ev.id
                        ? "bg-emerald-900 text-white border-emerald-900 shadow-2xs"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200/80"
                    }`}
                  >
                    <span>{ev.icon}</span>
                    <span className="truncate">{ev.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 block">Material Category</label>
                {selectedCategory !== "All" && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setPage(1);
                    }}
                    className="text-[10px] text-emerald-800 font-bold hover:underline"
                  >
                    Show all
                  </button>
                )}
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group ${
                      selectedCategory === cat
                        ? "bg-emerald-950 text-white font-bold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="truncate pr-1">{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        selectedCategory === cat
                          ? "bg-amber-400 text-emerald-950"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      }`}
                    >
                      {categoryCounts[cat] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability Toggle */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-gray-300 text-emerald-800 focus:ring-emerald-600"
                />
                <span className="text-xs font-semibold text-gray-700">In-Stock Only</span>
              </label>
            </div>

            {mobileFiltersOpen && (
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2.5 bg-emerald-950 text-white rounded-xl text-xs font-bold"
              >
                Apply Filters
              </button>
            )}
          </div>
        </aside>

        {/* Right Main Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Event Quick Filter Pills Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {eventTypes.map((ev) => (
              <button
                key={ev.id}
                onClick={() => {
                  setSelectedEventType(ev.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-2xs ${
                  selectedEventType === ev.id
                    ? "bg-[#123d32] text-amber-300 border-[#123d32] shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                }`}
              >
                <span>{ev.icon}</span>
                <span>{ev.label}</span>
              </button>
            ))}
          </div>

          {/* Active Category Banner if filtered */}
          {selectedCategory !== "All" && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Category Selected
                </span>
                <strong className="text-base font-bold text-emerald-950 font-display">
                  {selectedCategory}
                </strong>
                <span className="text-xs text-emerald-700 ml-2">
                  ({categoryCounts[selectedCategory] || 0} materials available to rent)
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                View all categories
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden px-3 py-1.5 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Icon name="filter" size={14} />
                <span>Filters</span>
              </button>

              <span className="text-xs font-semibold text-gray-500">
                Showing <strong className="text-gray-900">{pagedItems.length}</strong> of{" "}
                <strong className="text-gray-900">{sorted.length}</strong> event materials
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Sort by:</label>
              <select
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value as any);
                  setPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="featured">Featured Fleet</option>
                <option value="price-asc">Rental Rate: Low to High</option>
                <option value="price-desc">Rental Rate: High to Low</option>
                <option value="available">Highest Quantity Ready</option>
              </select>
            </div>
          </div>

          {/* Equipment Grid */}
          {sorted.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center space-y-3">
              <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
                <Icon name="search" size={24} />
              </div>
              <strong className="text-base font-bold text-gray-900 block font-display">
                No matching equipment found
              </strong>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try loosening your filters or search terms to see available equipment and materials in other categories.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-bold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {pagedItems.map((material) => (
                <EquipmentCard key={material.id} material={material} onAddToCart={onAddToCart} />
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-gray-200 rounded-xl bg-white text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    n === safePage
                      ? "bg-[#123d32] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-gray-200 rounded-xl bg-white text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Promotional Fleet Contract Banner */}
      <section className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-5 sm:p-8 md:p-10 text-emerald-950 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-white px-2.5 py-0.5 rounded-full inline-block">
            Project Subsidies & Volume Discounts
          </span>
          <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-emerald-950">
            Multi-Week Construction & Event Packages
          </h3>
          <p className="text-xs md:text-sm text-emerald-950/80 leading-relaxed">
            Planning a multi-week jobsite project or major festival? Enjoy up to 25% off weekly rates with inclusive preventative maintenance and priority replacement guarantees.
          </p>
        </div>

        <Link
          to="/discount"
          className="px-6 py-3 bg-emerald-950 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-colors whitespace-nowrap"
        >
          View Special Rates →
        </Link>
      </section>
    </div>
  );
};

export default ShopPage;
