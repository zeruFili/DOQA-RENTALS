import React, { useState, useMemo } from "react";
import { RentalReservation, Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";

interface RentalCalendarProps {
  onSelectRental?: (rental: RentalReservation) => void;
  preselectedMaterialId?: string;
  preselectedCategory?: string;
  hideHeaderStats?: boolean;
}

export const RentalCalendar: React.FC<RentalCalendarProps> = ({
  onSelectRental,
  preselectedMaterialId,
  preselectedCategory,
  hideHeaderStats = false,
}) => {
  const { rentals, materials } = useApp();

  const [calendarView, setCalendarView] = useState<"month" | "week" | "day" | "year">("month");
  // Default to June 18, 2025 (mid-month where multiple bookings are active)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 5, 18));
  const [filterCategory, setFilterCategory] = useState<string>(preselectedCategory || "All");
  const [filterMaterialId, setFilterMaterialId] = useState<string>(preselectedMaterialId || "All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedRentalForModal, setSelectedRentalForModal] = useState<RentalReservation | null>(null);

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

  // Filter materials available for the dropdown based on selected category
  const selectableMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (m.isArchived) return false;
      if (filterCategory !== "All" && m.category !== filterCategory) return false;
      return true;
    });
  }, [materials, filterCategory]);

  // Currently focused material (if any)
  const activeMaterial: Material | undefined = useMemo(() => {
    if (filterMaterialId === "All") return undefined;
    return materials.find((m) => m.id === filterMaterialId);
  }, [materials, filterMaterialId]);

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarView === "day") d.setDate(d.getDate() - 1);
    else if (calendarView === "week") d.setDate(d.getDate() - 7);
    else if (calendarView === "month") d.setMonth(d.getMonth() - 1);
    else if (calendarView === "year") d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarView === "day") d.setDate(d.getDate() + 1);
    else if (calendarView === "week") d.setDate(d.getDate() + 7);
    else if (calendarView === "month") d.setMonth(d.getMonth() + 1);
    else if (calendarView === "year") d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2025, 5, 18));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Filter rentals based on category, material, and status
  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      if (filterStatus !== "All" && r.status !== filterStatus) return false;
      if (filterCategory !== "All") {
        const hasCat = r.items.some((i) => i.category === filterCategory);
        if (!hasCat) return false;
      }
      if (filterMaterialId !== "All") {
        const hasMat = r.items.some((i) => i.materialId === filterMaterialId);
        if (!hasMat) return false;
      }
      return true;
    });
  }, [rentals, filterCategory, filterMaterialId, filterStatus]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyStartDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  // Dynamic 7-day week calculation based on currentDate
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [currentDate]);

  // Helper to calculate booked quantity and status for a specific date
  const getDateAvailability = (dateStr: string) => {
    const overlapping = filteredRentals.filter((r) => {
      const s = r.startDate.slice(0, 10);
      const e = r.expectedReturnDate.slice(0, 10);
      return dateStr >= s && dateStr <= e;
    });

    if (!activeMaterial) {
      return {
        overlapping,
        hasBookings: overlapping.length > 0,
        bookedUnits: overlapping.reduce(
          (sum, r) => sum + r.items.reduce((iSum, item) => iSum + item.quantity, 0),
          0
        ),
        isFull: false,
      };
    }

    // Material-specific availability calculation
    const totalCapacity = activeMaterial.totalOwned || 50;
    const bookedUnits = overlapping.reduce((sum, r) => {
      const match = r.items.find((i) => i.materialId === activeMaterial.id);
      return sum + (match ? match.quantity : 0);
    }, 0);

    const availableUnits = Math.max(0, totalCapacity - bookedUnits);
    const isFull = availableUnits === 0 && bookedUnits > 0;
    const isPartial = bookedUnits > 0 && availableUnits > 0;

    return {
      overlapping,
      hasBookings: overlapping.length > 0,
      totalCapacity,
      bookedUnits,
      availableUnits,
      isFull,
      isPartial,
    };
  };

  const handleSelectRental = (rental: RentalReservation) => {
    if (onSelectRental) {
      onSelectRental(rental);
    }
    setSelectedRentalForModal(rental);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-5 p-5 md:p-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              title="Previous period"
            >
              <Icon name="chevron" size={14} className="rotate-90" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              title="Next period"
            >
              <Icon name="chevron" size={14} className="-rotate-90" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors ml-1"
            >
              June 2025 (Live)
            </button>
          </div>

          <h2 className="text-xl font-black text-gray-950 font-display tracking-tight">
            {calendarView === "year" && `${year}`}
            {calendarView === "month" && `${monthNames[month]} ${year}`}
            {calendarView === "week" &&
              `Week of ${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getDate()} – ${weekDays[6].getDate()}, ${weekDays[6].getFullYear()}`}
            {calendarView === "day" &&
              `${monthNames[month]} ${currentDate.getDate()}, ${year}`}
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl border border-gray-200 flex items-center text-xs font-bold">
            {(["month", "week", "day", "year"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setCalendarView(v)}
                className={`px-3.5 py-1.5 rounded-lg capitalize transition-all ${
                  calendarView === v
                    ? "bg-white text-emerald-950 shadow-xs font-extrabold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment & Category Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50/70 rounded-2xl border border-gray-200/80 text-xs">
        {/* Category Picker */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-600 mb-1.5">
            Equipment Category ({categories.length - 1} Types)
          </label>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setFilterMaterialId("All");
            }}
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "✨ All Equipment Categories" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Equipment Item Picker */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-600 mb-1.5">
            Specific Equipment Item
          </label>
          <select
            value={filterMaterialId}
            onChange={(e) => setFilterMaterialId(e.target.value)}
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="All">🔍 All Equipment in Category</option>
            {selectableMaterials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.totalOwned} units)
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-600 mb-1.5">
            Booking Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs font-semibold border border-gray-200 rounded-xl p-2.5 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="All">All Booking Statuses</option>
            <option value="Active">🟢 Active (On-Site / In Transit)</option>
            <option value="Confirmed">🔵 Confirmed (Upcoming)</option>
            <option value="Returned">⚪ Returned (Completed)</option>
            <option value="Overdue">🔴 Overdue</option>
          </select>
        </div>
      </div>

      {/* Focused Item Availability Profile Banner (when specific equipment is selected) */}
      {activeMaterial && !hideHeaderStats && (
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#164337] to-emerald-900 text-white rounded-2xl shadow-md border border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={activeMaterial.imageUrl}
              alt={activeMaterial.name}
              className="w-14 h-14 rounded-xl object-cover border border-white/20 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                  {activeMaterial.category}
                </span>
                <span className="text-[10px] text-emerald-200 font-mono">
                  {activeMaterial.code}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {activeMaterial.name}
              </h3>
              <p className="text-[11px] text-emerald-100/70">
                Rate: ${activeMaterial.rentalPriceDaily}/day · Total Fleet: {activeMaterial.totalOwned} {activeMaterial.unitOfMeasure}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 bg-white/10 rounded-xl text-center min-w-24 border border-white/10">
              <span className="text-[10px] text-emerald-200 block font-semibold uppercase">Total Fleet</span>
              <strong className="text-lg font-black text-white">{activeMaterial.totalOwned}</strong>
            </div>
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-center min-w-24 border border-emerald-400/30">
              <span className="text-[10px] text-emerald-300 block font-semibold uppercase">Ready Stock</span>
              <strong className="text-lg font-black text-emerald-300">{activeMaterial.physicallyAvailable}</strong>
            </div>
            <div className="p-2.5 bg-amber-400/20 rounded-xl text-center min-w-24 border border-amber-300/30">
              <span className="text-[10px] text-amber-200 block font-semibold uppercase">Bookings</span>
              <strong className="text-lg font-black text-amber-300">{filteredRentals.length} Events</strong>
            </div>
          </div>
        </div>
      )}

      {/* Availability Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="calendar" size={13} className="text-emerald-800" />
            Calendar Guide:
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-2xs" />
            <span>Available for Rent</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-2xs" />
            <span>Active Event (On-Site)</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-2xs" />
            <span>Confirmed Booking</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block shadow-2xs" />
            <span>Completed & Returned</span>
          </span>
        </div>

        <span className="text-[11px] font-bold text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
          Showing {filteredRentals.length} Scheduled Bookings
        </span>
      </div>

      {/* MONTH VIEW */}
      {calendarView === "month" && (
        <div className="space-y-1">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-px border-b border-gray-200 text-center text-[11px] font-bold text-gray-500 uppercase py-2 bg-gray-50 rounded-t-2xl">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-2xl overflow-hidden border border-gray-200">
            {emptyStartDays.map((i) => (
              <div key={`empty-${i}`} className="bg-gray-50/40 min-h-28 p-2 text-gray-300" />
            ))}

            {daysArray.map((day) => {
              const mStr = String(month + 1).padStart(2, "0");
              const dStr = String(day).padStart(2, "0");
              const dateStr = `${year}-${mStr}-${dStr}`;

              const { overlapping, hasBookings, bookedUnits, totalCapacity, availableUnits, isFull } =
                getDateAvailability(dateStr);

              const isToday = day === 18 && month === 5 && year === 2025;

              return (
                <div
                  key={day}
                  className={`bg-white min-h-28 p-1.5 flex flex-col justify-between transition-colors hover:bg-emerald-50/20 ${
                    isToday ? "ring-2 ring-emerald-600 inset-0 z-10 bg-emerald-50/10" : ""
                  }`}
                >
                  {/* Day Header & Availability Indicator */}
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100/80">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? "bg-emerald-950 text-white" : "text-gray-700"
                      }`}
                    >
                      {day}
                    </span>

                    {/* Availability Dot & Status */}
                    {activeMaterial ? (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          isFull
                            ? "bg-rose-100 text-rose-800"
                            : bookedUnits > 0
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                        title={`${bookedUnits} booked of ${totalCapacity} capacity`}
                      >
                        {isFull ? "Full" : bookedUnits > 0 ? `${availableUnits} left` : "Avail"}
                      </span>
                    ) : (
                      hasBookings && (
                        <span className="text-[10px] font-bold text-gray-500 font-mono">
                          {overlapping.length} booked
                        </span>
                      )
                    )}
                  </div>

                  {/* Overlapping Bookings Pills */}
                  <div className="space-y-1 mt-1 flex-1">
                    {overlapping.slice(0, 3).map((r) => {
                      const isOverdue = r.status === "Overdue";
                      const isActive = r.status === "Active";
                      const isConfirmed = r.status === "Confirmed";

                      return (
                        <button
                          key={r.id}
                          onClick={() => handleSelectRental(r)}
                          className={`w-full text-left p-1 rounded-md text-[10px] font-bold line-clamp-1 border transition-all ${
                            isOverdue
                              ? "bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100"
                              : isActive
                              ? "bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100"
                              : isConfirmed
                              ? "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                          }`}
                          title={`${r.reservationNumber} · ${r.customerName} (${r.status})`}
                        >
                          <span className="truncate block">
                            {r.customerName.split(" ")[0]} · {r.items[0]?.materialName.slice(0, 16)}..
                          </span>
                        </button>
                      );
                    })}

                    {overlapping.length > 3 && (
                      <span className="text-[9px] text-gray-400 font-semibold block text-center">
                        +{overlapping.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {calendarView === "week" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {weekDays.map((dObj) => {
              const y = dObj.getFullYear();
              const m = String(dObj.getMonth() + 1).padStart(2, "0");
              const d = String(dObj.getDate()).padStart(2, "0");
              const dateStr = `${y}-${m}-${d}`;

              const { overlapping, bookedUnits, availableUnits, isFull } = getDateAvailability(dateStr);
              const isToday = dObj.getDate() === 18 && dObj.getMonth() === 5 && dObj.getFullYear() === 2025;

              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-2xl border transition-all min-h-72 flex flex-col ${
                    isToday ? "bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-400" : "bg-gray-50/60 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 mb-2">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">
                        {dObj.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      <strong className="text-xs font-bold text-gray-900">
                        {monthNames[dObj.getMonth()]} {dObj.getDate()}
                      </strong>
                    </div>
                    {isToday && (
                      <span className="text-[9px] font-extrabold text-white bg-emerald-950 px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  {activeMaterial && (
                    <div className="mb-2 p-1.5 bg-white rounded-lg border border-gray-200 text-[10px] flex justify-between">
                      <span className="text-gray-500">Fleet Status:</span>
                      <strong className={isFull ? "text-rose-600" : "text-emerald-700"}>
                        {isFull ? "0 Avail" : `${availableUnits} Available`}
                      </strong>
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    {overlapping.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelectRental(r)}
                        className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-emerald-500 hover:shadow-xs transition-all text-xs"
                      >
                        <strong className="text-gray-900 font-bold block truncate">{r.customerName}</strong>
                        <span className="text-[10px] text-gray-500 mt-0.5 block truncate">
                          {r.reservationNumber} · {r.items.map((i) => i.materialName).join(", ").slice(0, 24)}..
                        </span>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge
                            tone={
                              r.status === "Overdue"
                                ? "red"
                                : r.status === "Active"
                                ? "yellow"
                                : r.status === "Confirmed"
                                ? "blue"
                                : "gray"
                            }
                            size="sm"
                          >
                            {r.status}
                          </Badge>
                          <span className="text-[10px] font-mono text-gray-400">
                            {r.items.reduce((sum, item) => sum + item.quantity, 0)} units
                          </span>
                        </div>
                      </div>
                    ))}
                    {!overlapping.length && (
                      <div className="py-8 text-center text-gray-400 italic text-[11px]">
                        No bookings scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {calendarView === "day" && (
        <div className="space-y-3">
          {(() => {
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, "0");
            const d = String(currentDate.getDate()).padStart(2, "0");
            const currentDayStr = `${y}-${m}-${d}`;
            const { overlapping } = getDateAvailability(currentDayStr);

            return (
              <>
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                      SCHEDULE FOR SELECTED DATE
                    </span>
                    <h3 className="text-base font-bold text-gray-950 mt-0.5">
                      {monthNames[month]} {currentDate.getDate()}, {year}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-950 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                    {overlapping.length} Scheduled Events
                  </span>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {overlapping.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleSelectRental(r)}
                      className="p-4 hover:bg-emerald-50/30 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-950 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] font-extrabold uppercase">{r.startDate.slice(5, 7)}/25</span>
                          <strong className="text-sm font-black">{r.startDate.slice(8, 10)}</strong>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-gray-950">{r.customerName}</strong>
                            <Badge
                              tone={
                                r.status === "Overdue"
                                  ? "red"
                                  : r.status === "Active"
                                  ? "yellow"
                                  : r.status === "Confirmed"
                                  ? "blue"
                                  : "gray"
                              }
                              size="sm"
                            >
                              {r.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {r.reservationNumber} · {r.rentalDurationDays} Days · {r.deliveryAddress}
                          </p>
                          <span className="text-[11px] text-emerald-800 font-semibold block mt-1">
                            Materials: {r.items.map((i) => `${i.quantity}x ${i.materialName}`).join(", ")}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <strong className="text-base font-black text-gray-950 font-display">${r.totalCost}</strong>
                        <span className="text-[11px] text-gray-500 font-medium block">
                          Deposit: ${r.depositAmount} ({r.depositStatus})
                        </span>
                      </div>
                    </div>
                  ))}

                  {!overlapping.length && (
                    <div className="p-12 text-center text-gray-400">
                      <Icon name="calendar" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                      <strong className="text-sm text-gray-700 block font-bold">
                        No equipment booked for this date
                      </strong>
                      <span className="text-xs">All items in this fleet category are fully available for reservation.</span>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* YEAR OVERVIEW */}
      {calendarView === "year" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthNames.map((mName, mIdx) => {
            const countInMonth = filteredRentals.filter((r) => {
              const startMonth = parseInt(r.startDate.slice(5, 7), 10) - 1;
              const returnMonth = parseInt(r.expectedReturnDate.slice(5, 7), 10) - 1;
              return mIdx >= startMonth && mIdx <= returnMonth;
            }).length;

            return (
              <div
                key={mName}
                onClick={() => {
                  const d = new Date(year, mIdx, 1);
                  setCurrentDate(d);
                  setCalendarView("month");
                }}
                className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 hover:border-emerald-500 cursor-pointer transition-all hover:bg-white shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <strong className="text-sm font-bold text-gray-950">{mName}</strong>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      countInMonth > 0 ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {countInMonth} Events
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  {countInMonth > 0
                    ? `Click to view active rentals and scheduled gear availability in ${mName}.`
                    : `No bookings currently booked for ${mName} ${year}.`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Booking Modal */}
      {selectedRentalForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-amber-400 flex items-center justify-center font-bold">
                  <Icon name="calendar" size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950 font-display">
                    {selectedRentalForModal.reservationNumber}
                  </h3>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Contract: {selectedRentalForModal.contractNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRentalForModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Event & Customer Summary */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-sm font-bold text-emerald-950">
                  {selectedRentalForModal.customerName}
                </strong>
                <Badge
                  tone={
                    selectedRentalForModal.status === "Overdue"
                      ? "red"
                      : selectedRentalForModal.status === "Active"
                      ? "yellow"
                      : selectedRentalForModal.status === "Confirmed"
                      ? "blue"
                      : "green"
                  }
                >
                  {selectedRentalForModal.status}
                </Badge>
              </div>
              <p className="text-gray-700 italic">{selectedRentalForModal.notes}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1">
                <div>📞 {selectedRentalForModal.customerPhone}</div>
                <div>✉️ {selectedRentalForModal.customerEmail}</div>
                <div className="col-span-2">📍 {selectedRentalForModal.deliveryAddress}</div>
              </div>
            </div>

            {/* Dates & Timeline */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Rental Start</span>
                <strong className="text-gray-900">{selectedRentalForModal.startDate.replace("T", " ")}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Expected Return</span>
                <strong className="text-gray-900">{selectedRentalForModal.expectedReturnDate.replace("T", " ")}</strong>
              </div>
              <div className="col-span-2 text-[11px] text-emerald-800 font-semibold pt-1 border-t border-gray-200">
                Duration: {selectedRentalForModal.rentalDurationDays} Days · Handled by DOQA EVENTS Logistics
              </div>
            </div>

            {/* Rented Equipment Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                Rented Materials ({selectedRentalForModal.items.length})
              </span>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white text-xs">
                {selectedRentalForModal.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <strong className="text-gray-900 block font-bold">{item.materialName}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.materialCode} · {item.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-950 block">{item.quantity} units</span>
                      <span className="text-[10px] text-gray-500">${item.dailyRate}/day · Line: ${item.lineTotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Details */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Rental Subtotal:</span>
                <strong className="text-gray-900">${selectedRentalForModal.subtotal}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8.5%):</span>
                <strong className="text-gray-900">${selectedRentalForModal.taxAmount}</strong>
              </div>
              <div className="flex justify-between text-amber-900 font-semibold">
                <span>Security Deposit:</span>
                <strong>${selectedRentalForModal.depositAmount} ({selectedRentalForModal.depositStatus})</strong>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 font-black text-gray-950">
                <span>Total Cost:</span>
                <span className="font-display">${selectedRentalForModal.totalCost}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRentalForModal(null)}
              className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalCalendar;
