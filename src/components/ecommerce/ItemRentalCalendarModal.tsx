import React, { useState, useMemo } from "react";
import { Material, RentalReservation } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import { DealInfo } from "../../utils/deals";

interface ItemRentalCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  deal?: DealInfo;
  onConfirmRental: (material: Material, rentalDays: number) => void;
}

export const ItemRentalCalendarModal: React.FC<ItemRentalCalendarModalProps> = ({
  isOpen,
  onClose,
  material,
  deal,
  onConfirmRental,
}) => {
  const { rentals, checkMaterialAvailability } = useApp();

  // Calendar State - default to June 2025 where rich event mock bookings exist
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 5, 1));
  const [selectedDate, setSelectedDate] = useState<string>("2025-06-21");
  const [rentalDays, setRentalDays] = useState<number>(3);
  const [requestedQty, setRequestedQty] = useState<number>(1);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<RentalReservation | null>(null);

  if (!isOpen || !material) return null;

  // Effective pricing considering deals
  const dailyPrice = deal ? deal.discountedPrice : material.rentalPriceDaily;
  const originalPrice = deal ? deal.originalPrice : material.rentalPriceDaily;
  const currency = deal ? deal.currency : "USD";
  const currencySymbol = deal ? `${deal.currency} ` : "$";
  const subtotal = dailyPrice * rentalDays * requestedQty;
  const deposit = material.depositAmount ?? Math.round(dailyPrice * 1.5 * requestedQty);

  // Month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyStartDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Retrieve all existing bookings for THIS specific material
  const itemBookings: RentalReservation[] = useMemo(() => {
    // 1. Direct bookings from mock rentals that contain this materialId
    const direct = rentals.filter((r) =>
      r.items.some((item) => item.materialId === material.id)
    );

    if (direct.length >= 3) {
      return direct;
    }

    // 2. If fewer than 3 direct bookings, synthesize category-aligned bookings for realistic schedule
    // This ensures every single event equipment item has 4-5 clear bookings visible
    const syntheticBookings: RentalReservation[] = [
      {
        id: `SYN-RNT-${material.id}-01`,
        reservationNumber: `RES-2025-881`,
        customerId: "CUS-ENT-01",
        customerName: "Grand Horizon Gala & Corporate Summit",
        customerPhone: "+1 (555) 723-9912",
        customerEmail: "operations@grandhorizonevents.com",
        startDate: "2025-06-05T08:00",
        expectedReturnDate: "2025-06-08T20:00",
        rentalDurationDays: 4,
        items: [
          {
            materialId: material.id,
            materialCode: material.code,
            materialName: material.name,
            category: material.category,
            quantity: Math.min(material.totalOwned, Math.max(1, Math.floor(material.totalOwned * 0.4))),
            dailyRate: dailyPrice,
            totalDays: 4,
            lineTotal: dailyPrice * 4,
            returnedQuantity: 0,
            missingQuantity: 0,
            damagedQuantity: 0,
          },
        ],
        subtotal: dailyPrice * 4,
        taxAmount: dailyPrice * 0.3,
        discountAmount: 0,
        totalCost: dailyPrice * 4.3,
        depositAmount: deposit,
        depositStatus: "Held",
        paymentStatus: "Paid",
        amountPaid: dailyPrice * 4.3,
        outstandingBalance: 0,
        status: "Confirmed",
        deliveryType: "Delivery & Collection",
        deliveryAddress: "Starlight Convention Center, Hall B",
        assignedDriverId: "usr-04",
        assignedDriverName: "Eric James",
        responsibleEmployee: "Maya Chen",
        warehouse: material.warehouse || "Central Warehouse",
        contractNumber: "CTR-2025-881",
        notes: `Reserved for 3-day executive summit and awards ceremony. Reserved ${Math.min(material.totalOwned, Math.max(1, Math.floor(material.totalOwned * 0.4)))} units.`,
        isOverdue: false,
      },
      {
        id: `SYN-RNT-${material.id}-02`,
        reservationNumber: `RES-2025-894`,
        customerId: "CUS-WED-02",
        customerName: "Royal Garden Luxury Wedding & Reception",
        customerPhone: "+1 (555) 441-2098",
        customerEmail: "weddings@royalgardens.com",
        startDate: "2025-06-13T10:00",
        expectedReturnDate: "2025-06-16T17:00",
        rentalDurationDays: 4,
        items: [
          {
            materialId: material.id,
            materialCode: material.code,
            materialName: material.name,
            category: material.category,
            quantity: Math.min(material.totalOwned, Math.max(1, Math.floor(material.totalOwned * 0.6))),
            dailyRate: dailyPrice,
            totalDays: 4,
            lineTotal: dailyPrice * 4,
            returnedQuantity: 0,
            missingQuantity: 0,
            damagedQuantity: 0,
          },
        ],
        subtotal: dailyPrice * 4,
        taxAmount: dailyPrice * 0.35,
        discountAmount: 0,
        totalCost: dailyPrice * 4.35,
        depositAmount: deposit,
        depositStatus: "Held",
        paymentStatus: "Partial",
        amountPaid: dailyPrice * 2,
        outstandingBalance: dailyPrice * 2.35,
        status: "Active",
        deliveryType: "Delivery & Collection",
        deliveryAddress: "Botanical Pavilions, North Lawn",
        assignedDriverId: "usr-05",
        assignedDriverName: "David K.",
        responsibleEmployee: "Sarah Jenkins",
        warehouse: material.warehouse || "Central Warehouse",
        contractNumber: "CTR-2025-894",
        notes: "High-end botanical wedding reception and evening lighting production.",
        isOverdue: false,
      },
      {
        id: `SYN-RNT-${material.id}-03`,
        reservationNumber: `RES-2025-915`,
        customerId: "CUS-FEST-03",
        customerName: "Summer Sounds Festival & Live Stage",
        customerPhone: "+1 (555) 902-3341",
        customerEmail: "production@summersounds.org",
        startDate: "2025-06-25T07:00",
        expectedReturnDate: "2025-06-28T22:00",
        rentalDurationDays: 4,
        items: [
          {
            materialId: material.id,
            materialCode: material.code,
            materialName: material.name,
            category: material.category,
            quantity: Math.min(material.totalOwned, Math.max(1, Math.floor(material.totalOwned * 0.75))),
            dailyRate: dailyPrice,
            totalDays: 4,
            lineTotal: dailyPrice * 4,
            returnedQuantity: 0,
            missingQuantity: 0,
            damagedQuantity: 0,
          },
        ],
        subtotal: dailyPrice * 4,
        taxAmount: dailyPrice * 0.3,
        discountAmount: 0,
        totalCost: dailyPrice * 4.3,
        depositAmount: deposit,
        depositStatus: "Held",
        paymentStatus: "Paid",
        amountPaid: dailyPrice * 4.3,
        outstandingBalance: 0,
        status: "Confirmed",
        deliveryType: "Customer Pick-Up",
        deliveryAddress: "Festival Grounds, Stage East",
        assignedDriverId: "usr-04",
        assignedDriverName: "Eric James",
        responsibleEmployee: "Maya Chen",
        warehouse: material.warehouse || "Central Warehouse",
        contractNumber: "CTR-2025-915",
        notes: "Multi-stage music & food festival equipment package.",
        isOverdue: false,
      },
      {
        id: `SYN-RNT-${material.id}-04`,
        reservationNumber: `RES-2025-942`,
        customerId: "CUS-CORP-04",
        customerName: "Tech Innovators Expo 2025",
        customerPhone: "+1 (555) 831-7711",
        customerEmail: "logistics@techinnovatorsexpo.com",
        startDate: "2025-07-08T09:00",
        expectedReturnDate: "2025-07-11T18:00",
        rentalDurationDays: 4,
        items: [
          {
            materialId: material.id,
            materialCode: material.code,
            materialName: material.name,
            category: material.category,
            quantity: Math.min(material.totalOwned, Math.max(1, Math.floor(material.totalOwned * 0.5))),
            dailyRate: dailyPrice,
            totalDays: 4,
            lineTotal: dailyPrice * 4,
            returnedQuantity: 0,
            missingQuantity: 0,
            damagedQuantity: 0,
          },
        ],
        subtotal: dailyPrice * 4,
        taxAmount: dailyPrice * 0.3,
        discountAmount: 0,
        totalCost: dailyPrice * 4.3,
        depositAmount: deposit,
        depositStatus: "Held",
        paymentStatus: "Paid",
        amountPaid: dailyPrice * 4.3,
        outstandingBalance: 0,
        status: "Confirmed",
        deliveryType: "Delivery & Collection",
        deliveryAddress: "Downtown Trade & Expo Center",
        assignedDriverId: "usr-04",
        assignedDriverName: "Eric James",
        responsibleEmployee: "Maya Chen",
        warehouse: material.warehouse || "Central Warehouse",
        contractNumber: "CTR-2025-942",
        notes: "Annual technology exhibition and sponsor booth installations.",
        isOverdue: false,
      },
    ];

    return [...direct, ...syntheticBookings];
  }, [rentals, material, dailyPrice, deposit]);

  // Calculate day availability
  const getDayAvailability = (dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const overlapping = itemBookings.filter((r) => {
      const s = r.startDate.slice(0, 10);
      const e = r.expectedReturnDate.slice(0, 10);
      return dayStr >= s && dayStr <= e;
    });

    const bookedUnits = overlapping.reduce((sum, r) => {
      const match = r.items.find((i) => i.materialId === material.id);
      return sum + (match ? match.quantity : 1);
    }, 0);

    const totalFleet = material.totalOwned || 50;
    const remainingUnits = Math.max(0, totalFleet - bookedUnits);
    const isFullyBooked = remainingUnits === 0 && bookedUnits > 0;
    const isPartiallyBooked = bookedUnits > 0 && remainingUnits > 0;

    return {
      dayStr,
      overlapping,
      bookedUnits,
      remainingUnits,
      isFullyBooked,
      isPartiallyBooked,
      isCompletelyFree: bookedUnits === 0,
    };
  };

  // Selected date availability check
  const selectedDateAvailability = useMemo(() => {
    return checkMaterialAvailability(material.id, `${selectedDate}T09:00`, `${selectedDate}T18:00`, requestedQty);
  }, [checkMaterialAvailability, material.id, selectedDate, requestedQty]);

  // Handle month shift
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Add to cart with user selected parameters
  const handleConfirm = () => {
    const targetMaterial = deal
      ? {
          ...material,
          rentalPriceDaily: deal.discountedPrice,
          rentalPriceWeekly: Math.round(deal.discountedPrice * 5.5),
        }
      : material;

    onConfirmRental(targetMaterial, rentalDays);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rental-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#123d32] to-[#1d5244] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
              <Icon name="calendar" size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                DOQA EVENTS • RENTAL RESERVATION & SCHEDULE
              </span>
              <h2 id="rental-modal-title" className="text-lg sm:text-xl font-bold font-display text-white">
                Equipment Rental & Booking Calendar
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm font-bold"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Specific Item Banner Showcase */}
          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start">
            <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-emerald-200 relative group">
              <img
                src={material.imageUrl}
                alt={material.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {deal && (
                <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                  {deal.discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-900 text-white px-2.5 py-0.5 rounded-md">
                  {material.category}
                </span>
                <span className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                  SKU: {material.code}
                </span>
                <span className="text-[11px] text-gray-500">
                  {material.brand} • {material.model}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 font-display">
                {material.name}
              </h3>

              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {material.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium">Daily Rate:</span>
                  {deal ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="line-through text-gray-400 text-xs">
                        {deal.originalPrice.toLocaleString()} {deal.currency}
                      </span>
                      <strong className="text-rose-600 font-black text-sm">
                        {deal.discountedPrice.toLocaleString()} {deal.currency}/day
                      </strong>
                    </div>
                  ) : (
                    <strong className="text-emerald-900 font-black text-sm">
                      ${material.rentalPriceDaily}/day
                    </strong>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium">Fleet Size:</span>
                  <Badge tone={material.physicallyAvailable > 0 ? "green" : "red"} size="sm">
                    {material.physicallyAvailable} Available / {material.totalOwned} Total
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium">Location:</span>
                  <span className="font-semibold text-gray-700">
                    {material.storageLocation} ({material.warehouse})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Booking Calendar & Existing Reservations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Calendar Grid (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-gray-900 font-display">
                    {monthNames[month]} {year}
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {itemBookings.length} Scheduled Bookings
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs"
                    title="Previous month"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(2025, 5, 1))}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px] font-bold text-gray-700"
                  >
                    June 2025
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs"
                    title="Next month"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Days */}
              <div className="grid grid-cols-7 gap-1">
                {emptyStartDays.map((d) => (
                  <div key={`empty-${d}`} className="h-14 bg-gray-50/50 rounded-xl border border-transparent" />
                ))}

                {daysArray.map((dayNum) => {
                  const availability = getDayAvailability(dayNum);
                  const isSelected = selectedDate === availability.dayStr;

                  let bgTone = "bg-emerald-50/50 border-emerald-100 text-emerald-950 hover:bg-emerald-100/60";
                  let statusBadge = (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Ready to reserve" />
                  );

                  if (availability.isFullyBooked) {
                    bgTone = "bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100";
                    statusBadge = (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" title="Fully reserved" />
                    );
                  } else if (availability.isPartiallyBooked) {
                    bgTone = "bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100";
                    statusBadge = (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" title="Partially reserved" />
                    );
                  }

                  if (isSelected) {
                    bgTone = "bg-emerald-900 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500";
                  }

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDate(availability.dayStr)}
                      className={`h-14 p-1.5 rounded-xl border text-left transition-all flex flex-col justify-between ${bgTone}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold ${isSelected ? "text-white" : ""}`}>
                          {dayNum}
                        </span>
                        {!isSelected && statusBadge}
                      </div>

                      <div className="text-[9px] truncate">
                        {availability.isFullyBooked ? (
                          <span className={isSelected ? "text-rose-200 font-bold" : "text-rose-700 font-bold"}>
                            Booked ({availability.bookedUnits})
                          </span>
                        ) : availability.isPartiallyBooked ? (
                          <span className={isSelected ? "text-amber-200 font-bold" : "text-amber-800 font-bold"}>
                            {availability.remainingUnits} free
                          </span>
                        ) : (
                          <span className={isSelected ? "text-emerald-200 font-medium" : "text-emerald-700 font-medium"}>
                            Available
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Available</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Partial Fleet Reserved</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Fully Booked</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">Click any date to inspect details</span>
              </div>
            </div>

            {/* Right Pane: Selected Date Existing Bookings & Reservation Form (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Existing Bookings for this item */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 font-display flex items-center gap-1.5">
                    <Icon name="calendar" size={15} className="text-emerald-700" />
                    <span>Existing Bookings on {selectedDate}</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                    {itemBookings.filter((b) => selectedDate >= b.startDate.slice(0, 10) && selectedDate <= b.expectedReturnDate.slice(0, 10)).length} Active
                  </span>
                </div>

                {(() => {
                  const activeOnSelected = itemBookings.filter(
                    (b) => selectedDate >= b.startDate.slice(0, 10) && selectedDate <= b.expectedReturnDate.slice(0, 10)
                  );

                  if (activeOnSelected.length === 0) {
                    return (
                      <div className="py-4 text-center space-y-1.5 bg-emerald-50/40 rounded-xl border border-emerald-100 p-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xs font-bold">
                          ✓
                        </div>
                        <p className="text-xs font-bold text-emerald-950">No Reservations on this Date</p>
                        <p className="text-[11px] text-emerald-700">
                          Full inventory fleet ({material.physicallyAvailable} units ready) is currently free and open for booking.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {activeOnSelected.map((booking) => {
                        const itemMatch = booking.items.find((i) => i.materialId === material.id);
                        const bookedCount = itemMatch ? itemMatch.quantity : 1;

                        return (
                          <div
                            key={booking.id}
                            onClick={() => setSelectedBookingForDetails(booking)}
                            className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-all space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-gray-400">
                                {booking.reservationNumber}
                              </span>
                              <Badge
                                tone={
                                  booking.status === "Active"
                                    ? "blue"
                                    : booking.status === "Confirmed"
                                    ? "green"
                                    : "gray"
                                }
                                size="sm"
                              >
                                {booking.status}
                              </Badge>
                            </div>

                            <div className="font-bold text-xs text-gray-900 truncate">
                              {booking.customerName}
                            </div>

                            <div className="text-[11px] text-gray-500 flex items-center justify-between">
                              <span>
                                📅 {booking.startDate.slice(0, 10)} → {booking.expectedReturnDate.slice(0, 10)}
                              </span>
                              <span className="font-bold text-emerald-800">
                                {bookedCount} units reserved
                              </span>
                            </div>

                            <p className="text-[10px] text-gray-400 truncate italic">
                              "{booking.notes || "Event equipment reservation"}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* All Scheduled Items Summary Collapsible */}
                <div className="pt-2 border-t border-gray-100">
                  <details className="text-[11px] text-gray-600 group">
                    <summary className="font-bold text-emerald-900 cursor-pointer hover:underline flex items-center justify-between">
                      <span>View all {itemBookings.length} scheduled bookings for this item</span>
                      <span className="group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {itemBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-1.5 bg-gray-50 rounded-lg text-[10px] flex items-center justify-between"
                        >
                          <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                            {b.customerName}
                          </span>
                          <span className="text-gray-500">
                            {b.startDate.slice(5, 10)} to {b.expectedReturnDate.slice(5, 10)}
                          </span>
                          <span className="font-bold text-emerald-700">
                            {b.items.find((i) => i.materialId === material.id)?.quantity || 1} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>

              {/* Reserve & Configure Rental Form */}
              <div className="bg-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold font-display text-white">
                    Book & Reserve This Equipment
                  </h4>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full">
                    Live Check
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white/10 text-white text-xs border border-white/20 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block mb-1">
                      Duration
                    </label>
                    <select
                      value={rentalDays}
                      onChange={(e) => setRentalDays(parseInt(e.target.value) || 1)}
                      className="w-full p-2 rounded-xl bg-emerald-900 text-white text-xs border border-white/20 outline-none font-bold"
                    >
                      <option value={1}>1 Day (24h)</option>
                      <option value={2}>2 Days (48h)</option>
                      <option value={3}>3 Days (Weekend / Event)</option>
                      <option value={5}>5 Days (Multi-day Summit)</option>
                      <option value={7}>7 Days (Full Week)</option>
                      <option value={14}>14 Days (2 Weeks)</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Deposit Breakdown */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 text-xs">
                  <div className="flex justify-between text-emerald-200">
                    <span>
                      Daily Rate ({rentalDays} {rentalDays === 1 ? "day" : "days"}):
                    </span>
                    <strong className="text-white">
                      {currencySymbol}{dailyPrice.toLocaleString()} / day
                    </strong>
                  </div>

                  {deal && (
                    <div className="flex justify-between text-amber-300 text-[11px] font-semibold">
                      <span>Discount ({deal.discountPercent}% OFF):</span>
                      <span>- {currencySymbol}{(deal.savingsAmount * rentalDays).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-200 text-[11px]">
                    <span>Security Deposit (Refundable):</span>
                    <span>{currencySymbol}{deposit.toLocaleString()}</span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                    <span className="font-bold text-white text-xs">Rental Subtotal:</span>
                    <strong className="text-lg font-black text-amber-400 font-display">
                      {currencySymbol}{subtotal.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Confirm Action Button */}
                <button
                  onClick={handleConfirm}
                  disabled={material.physicallyAvailable === 0}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Icon name="calendar" size={15} />
                  <span>Confirm Rental & Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>
            DOQA EVENTS Equipment Guarantee: All materials are fully inspected and tested prior to dispatch.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 font-bold text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Booking Details Popover Modal */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono text-gray-400">
                  {selectedBookingForDetails.reservationNumber}
                </span>
                <h3 className="text-base font-bold text-gray-900 font-display">
                  Reservation Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Client / Event</span>
                <strong className="text-gray-900 text-sm block">{selectedBookingForDetails.customerName}</strong>
                <span className="text-gray-500 block">{selectedBookingForDetails.customerEmail} • {selectedBookingForDetails.customerPhone}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Start Date</span>
                  <strong className="text-gray-800">{selectedBookingForDetails.startDate.replace("T", " ")}</strong>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Expected Return</span>
                  <strong className="text-gray-800">{selectedBookingForDetails.expectedReturnDate.replace("T", " ")}</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Reserved Equipment In This Event</span>
                {selectedBookingForDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-emerald-950 font-semibold">
                    <span className="truncate max-w-[200px]">{item.materialName}</span>
                    <span>{item.quantity} units</span>
                  </div>
                ))}
              </div>

              {selectedBookingForDetails.notes && (
                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600 italic text-[11px]">
                  "{selectedBookingForDetails.notes}"
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBookingForDetails(null)}
              className="w-full py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemRentalCalendarModal;
