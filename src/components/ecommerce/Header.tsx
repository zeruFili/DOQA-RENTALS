import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../common/Icons";
import { useApp } from "../../context/AppContext";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
}) => {
  const { currentUser, switchUserRole } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);

  const navLinks = [
    { label: "Shop Fleet", path: "/" },
    ...(currentUser.role === "admin" ? [{ label: "Event Calendar", path: "/calendar" }] : []),
    { label: "New Arrivals", path: "/new-arrivals" },
    { label: "Deals & Specials", path: "/discount" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Main Header Row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-[#123d32] text-amber-400 font-display font-black text-base flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            DE
          </div>
          <div>
            <span className="font-display font-black text-xl text-gray-950 tracking-tight block leading-tight">
              DOQA EVENTS
            </span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
              Event Management & Rentals
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold tracking-tight transition-colors py-1 border-b-2 ${
                  isActive
                    ? "text-[#123d32] border-[#123d32]"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Role Indicator, Cart */}
        <div className="flex items-center gap-3">

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleSelectOpen(!roleSelectOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-800"
              title="Current User Persona"
            >
              <span className="w-7 h-7 rounded-lg bg-emerald-950 text-white font-bold flex items-center justify-center text-xs">
                {currentUser.avatar}
              </span>
              <span className="hidden sm:inline capitalize">{currentUser.role === "admin" ? "Admin User" : "User"}</span>
              <Icon name="chevron" size={12} className="text-gray-400" />
            </button>

            {roleSelectOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 animate-scale-up"
                onClick={() => setRoleSelectOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Active Persona
                  </span>
                  <span className="text-xs font-bold text-gray-900 block truncate">{currentUser.name}</span>
                </div>
                {[
                  { role: "admin", label: "Admin User" },
                  { role: "user", label: "User" },
                ].map((r) => (
                  <button
                    key={r.role}
                    onClick={() => switchUserRole(r.role as any)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      currentUser.role === r.role ? "bg-emerald-950 text-white font-bold" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>{r.label}</span>
                    {currentUser.role === r.role && <Icon name="check" size={12} className="text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Bag Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#123d32] text-white rounded-xl text-xs font-bold hover:bg-[#1a4a3e] transition-all shadow-sm relative group"
            title="View Reservation & Order Cart"
          >
            <Icon name="cart" size={16} className="text-amber-400" />
            <span className="hidden sm:inline">Reservation Cart</span>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
            aria-label="Toggle Navigation"
          >
            <Icon name={mobileMenuOpen ? "close" : "grid"} size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 bg-white space-y-2 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-gray-700 hover:text-emerald-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
