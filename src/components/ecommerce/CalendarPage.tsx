import React, { useState } from "react";
import { Link } from "react-router-dom";
import RentalCalendar from "../rentals/RentalCalendar";
import Icon from "../common/Icons";

export const CalendarPage: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const categories = [
    { label: "All Fleet", icon: "✨", id: "All" },
    { label: "Seating & Lounge", icon: "🪑", id: "Seating & Lounge Furniture" },
    { label: "Tables & Stations", icon: "🍽️", id: "Tables & Banquet Stations" },
    { label: "Tents & Marquees", icon: "🎪", id: "Structures, Tents & Canopies" },
    { label: "Staging & Rigging", icon: "🎭", id: "Staging, Truss & Rigging" },
    { label: "Audio & Sound", icon: "🔊", id: "Audio & Sound Systems" },
    { label: "Lighting & FX", icon: "💡", id: "Lighting & Special FX" },
    { label: "Video & LED Walls", icon: "🖥️", id: "Video, Screens & LED Displays" },
    { label: "Tableware & Linens", icon: "🍷", id: "Tableware, Glassware & Linens" },
    { label: "Decor & Backdrops", icon: "🌸", id: "Decor, Florals & Backdrops" },
    { label: "Power & Climate", icon: "⚡", id: "Power Distribution & Climate" },
    { label: "Crowd Control & Booths", icon: "🚧", id: "Crowd Control & Exhibition Booths" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#123d32] via-[#1a4a3e] to-[#0d2a23] text-white p-8 md:p-12 shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              LIVE EVENT FLEET SCHEDULE
            </span>
            <span className="text-xs text-emerald-200 font-semibold">
              • 66 Active & Scheduled Bookings
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display text-white">
            Equipment Availability & Booking Calendar
          </h1>

          <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed pt-1">
            Explore live event bookings and equipment availability across all 11 event rental categories.
            Select any equipment item to inspect exact dates that are booked for weddings, conferences, concerts, and galas,
            and view open windows ready for instant rental reservations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Icon name="calendar" size={14} />
              <span>Book Equipment Now</span>
            </Link>
            <Link
              to="/discount"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs border border-white/20 transition-colors inline-flex items-center gap-2"
            >
              <span>View Special Deals</span>
              <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                20-30% OFF
              </span>
            </Link>
          </div>
        </div>

        {/* Decorative Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      </div>

      {/* Quick Category Quick-Select Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
              selectedCat === c.id
                ? "bg-emerald-950 text-white border-emerald-950 shadow-xs"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Calendar */}
      <RentalCalendar preselectedCategory={selectedCat} />
    </div>
  );
};

export default CalendarPage;
