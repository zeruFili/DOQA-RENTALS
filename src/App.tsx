import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/ecommerce/Header";
import Footer from "./components/ecommerce/Footer";
import ShopPage from "./components/ecommerce/ShopPage";
import ProductDetailPage from "./components/ecommerce/ProductDetailPage";
import NewArrivalsPage from "./components/ecommerce/NewArrivalsPage";
import DiscountPage from "./components/ecommerce/DiscountPage";
import CalendarPage from "./components/ecommerce/CalendarPage";
import CartDrawer, { CartItem } from "./components/ecommerce/CartDrawer";
import Toast from "./components/common/Toast";
import ItemRentalCalendarModal from "./components/ecommerce/ItemRentalCalendarModal";
import { Material } from "./types";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function StorefrontContent() {
  const { currentUser, toast, showToast, rentalModalItem, closeRentalModal } = useApp();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const handleAddToCart = (material: Material, type: "rent" | "buy", days: number = 3) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.material.id === material.id && i.orderType === type
      );
      if (existing) {
        return prev.map((i) =>
          i.material.id === material.id && i.orderType === type
            ? { ...i, quantity: Math.min(i.quantity + 1, material.physicallyAvailable) }
            : i
        );
      }
      return [
        ...prev,
        {
          material,
          orderType: type,
          quantity: 1,
          rentalDays: days,
        },
      ];
    });

    showToast(`Added ${material.name} to ${type === "rent" ? "rental" : "purchase"} cart!`);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (materialId: string, orderType: "rent" | "buy", delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.material.id === materialId && i.orderType === orderType) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleUpdateDays = (materialId: string, days: number) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.material.id === materialId && i.orderType === "rent"
          ? { ...i, rentalDays: days }
          : i
      )
    );
  };

  const handleRemoveItem = (materialId: string, orderType: "rent" | "buy") => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.material.id === materialId && i.orderType === orderType))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#18352b] flex flex-col font-sans antialiased">
      <ScrollToTop />

      {/* E-Commerce Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main E-Commerce Content Area */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Routes>
          <Route path="/" element={<ShopPage onAddToCart={handleAddToCart} />} />
          <Route
            path="/calendar"
            element={currentUser.role === "admin" ? <CalendarPage /> : <Navigate to="/" replace />}
          />
          <Route path="/product/:id" element={<ProductDetailPage onAddToCart={handleAddToCart} />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage onAddToCart={handleAddToCart} />} />
          <Route path="/discount" element={<DiscountPage onAddToCart={handleAddToCart} />} />
        </Routes>
      </main>

      {/* E-Commerce Footer */}
      <Footer />

      {/* E-Commerce Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateDays={handleUpdateDays}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Item-Specific Rental Booking Calendar Modal */}
      {rentalModalItem && (
        <ItemRentalCalendarModal
          isOpen={true}
          onClose={closeRentalModal}
          material={rentalModalItem.material}
          deal={rentalModalItem.deal}
          onConfirmRental={(material, days) => {
            handleAddToCart(material, "rent", days);
          }}
        />
      )}

      {/* Real-time Toast Notifications */}
      <Toast toast={toast} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <StorefrontContent />
      </BrowserRouter>
    </AppProvider>
  );
}
