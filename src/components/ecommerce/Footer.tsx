import React from "react";
import { Link } from "react-router-dom";
import Icon from "../common/Icons";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#123d32] text-white border-t border-emerald-900/60 mt-20">
      {/* Upper Newsletter / Assurance Banner */}
      <div className="border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Icon name="truck" size={24} />
            </div>
            <div>
              <strong className="text-sm font-bold block">Certified Logistics & Dispatch</strong>
              <span className="text-xs text-emerald-200/70">Scheduled crane trucks, flatbeds, and mobile couriers</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Icon name="wrench" size={24} />
            </div>
            <div>
              <strong className="text-sm font-bold block">100% Pre-Rental Inspection</strong>
              <span className="text-xs text-emerald-200/70">Every machine and tool safety checked and tested</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Icon name="shield" size={24} />
            </div>
            <div>
              <strong className="text-sm font-bold block">Flexible Terms & Damage Cover</strong>
              <span className="text-xs text-emerald-200/70">Commercial damage waiver and refundable security deposits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 font-display font-black flex items-center justify-center text-sm shadow-md">
              DE
            </div>
            <strong className="text-lg font-bold font-display tracking-tight text-white">DOQA EVENTS</strong>
          </div>
          <p className="text-xs text-emerald-200/70 leading-relaxed">
            The premier event equipment, audiovisual, and banquet material rental ecosystem. Empowering wedding planners, corporate producers, festival organizers, and venue managers with real-time stock control and on-site delivery.
          </p>
          <div className="text-xs text-emerald-300/80 font-medium space-y-1">
            <p>📍 Central Depot: 400 Logistics Way, Waterfront District</p>
            <p>📞 24/7 Event Hotline: +1 (800) 555-EVENT</p>
          </div>
        </div>

        {/* Customer & Contractor Support */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Customer Support</h4>
          <ul className="space-y-2 text-xs text-emerald-100/70">
            <li><Link to="/" className="hover:text-white transition-colors">Rental Agreements & Master Contracts</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Security Deposit Liability Terms</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Site Delivery & Collection Policies</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Pre-Dispatch Inspection Checklist</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Emergency Breakdown Assistance</Link></li>
          </ul>
        </div>

        {/* Operating Hours & Newsletter */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Depot Hours</h4>
          <div className="text-xs text-emerald-200/70 space-y-1.5">
            <p className="flex justify-between"><span>Monday – Friday:</span> <strong className="text-white">06:00 – 19:00</strong></p>
            <p className="flex justify-between"><span>Saturday:</span> <strong className="text-white">07:00 – 16:00</strong></p>
            <p className="flex justify-between"><span>Sunday:</span> <span className="text-amber-400 font-semibold">Emergency Event Dispatch</span></p>
          </div>
          <div className="pt-2">
            <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block mb-1">
              Join Event Planner Updates
            </span>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter event planner email"
                className="w-full px-3 py-1.5 text-xs bg-white/10 rounded-xl border border-white/20 text-white placeholder-emerald-300/50 outline-none"
              />
              <button className="px-3 py-1.5 bg-amber-400 text-emerald-950 rounded-xl text-xs font-bold hover:bg-amber-300 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5 text-center text-xs text-emerald-300/60">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>© 2026 DOQA EVENTS Inc. Event Management & Materials Fleet. All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 text-[11px]">
            <Link to="/" className="hover:text-white">Privacy Policy</Link>
            <Link to="/" className="hover:text-white">Terms of Rental</Link>
            <Link to="/" className="hover:text-white">Security & Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
