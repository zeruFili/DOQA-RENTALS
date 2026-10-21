import { Material } from "../types";

export interface DealInfo {
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  savingsAmount: number;
  currency: string;
}

// Curated verified deals with accurate mathematical relationships
export const curatedDealOverrides: Record<
  string,
  { originalPrice: number; discountedPrice: number; discountPercent: number }
> = {
  // 1. Chiavari Chair - exactly matches user prompt (1,000 ETB -> 800 ETB, 20% OFF)
  "MAT-2025-01": { originalPrice: 1000, discountedPrice: 800, discountPercent: 20 },
  // 2. Oak Cross Back Chair (1,200 ETB -> 960 ETB, 20% OFF)
  "MAT-2025-09": { originalPrice: 1200, discountedPrice: 960, discountPercent: 20 },
  // 3. Chesterfield Leather Sofa (18,000 ETB -> 13,500 ETB, 25% OFF)
  "MAT-2025-02": { originalPrice: 18000, discountedPrice: 13500, discountPercent: 25 },
  // 4. Emerald Velvet Curved Sofa (24,000 ETB -> 16,800 ETB, 30% OFF)
  "MAT-2025-03": { originalPrice: 24000, discountedPrice: 16800, discountPercent: 30 },
  // 5. Tolix Barstools Set (1,800 ETB -> 1,440 ETB, 20% OFF)
  "MAT-2025-04": { originalPrice: 1800, discountedPrice: 1440, discountPercent: 20 },
  // 6. Round Banquet Table 72in (2,500 ETB -> 2,000 ETB, 20% OFF)
  "MAT-2025-10": { originalPrice: 2500, discountedPrice: 2000, discountPercent: 20 },
  // 7. Reclaimed Pine Farm Table (9,500 ETB -> 7,600 ETB, 20% OFF)
  "MAT-2025-11": { originalPrice: 9500, discountedPrice: 7600, discountPercent: 20 },
  // 8. Modular LED Cocktail Bar (28,000 ETB -> 19,600 ETB, 30% OFF)
  "MAT-2025-13": { originalPrice: 28000, discountedPrice: 19600, discountPercent: 30 },
  // 9. 20x40 Marquee Tent (60,000 ETB -> 45,000 ETB, 25% OFF)
  "MAT-2025-05": { originalPrice: 60000, discountedPrice: 45000, discountPercent: 25 },
  // 10. 40x80 Clear-Span Pavilion (220,000 ETB -> 165,000 ETB, 25% OFF)
  "MAT-2025-15": { originalPrice: 220000, discountedPrice: 165000, discountPercent: 25 },
  // 11. Bedouin Stretch Canopy (90,000 ETB -> 67,500 ETB, 25% OFF)
  "MAT-2025-16": { originalPrice: 90000, discountedPrice: 67500, discountPercent: 25 },
  // 12. Hexagonal Pop-up Gazebo (12,000 ETB -> 9,600 ETB, 20% OFF)
  "MAT-2025-17": { originalPrice: 12000, discountedPrice: 9600, discountPercent: 20 },
  // 13. Stage Deck Platform (5,000 ETB -> 4,000 ETB, 20% OFF)
  "MAT-2025-06": { originalPrice: 5000, discountedPrice: 4000, discountPercent: 20 },
  // 14. Aluminum Box Truss (4,000 ETB -> 3,200 ETB, 20% OFF)
  "MAT-2025-19": { originalPrice: 4000, discountedPrice: 3200, discountPercent: 20 },
  // 15. Acrylic Speaker Podium (11,000 ETB -> 8,800 ETB, 20% OFF)
  "MAT-2025-20": { originalPrice: 11000, discountedPrice: 8800, discountPercent: 20 },
  // 16. Active Line Array Sound System (80,000 ETB -> 56,000 ETB, 30% OFF)
  "MAT-2025-07": { originalPrice: 80000, discountedPrice: 56000, discountPercent: 30 },
  // 17. Behringer X32 Digital Mixer (24,000 ETB -> 18,000 ETB, 25% OFF)
  "MAT-2025-22": { originalPrice: 24000, discountedPrice: 18000, discountPercent: 25 },
  // 18. Shure Wireless Mic Quad System (14,000 ETB -> 11,200 ETB, 20% OFF)
  "MAT-2025-23": { originalPrice: 14000, discountedPrice: 11200, discountPercent: 20 },
  // 19. Pioneer DJ NXS2 Professional Tour Rig (35,000 ETB -> 26,250 ETB, 25% OFF)
  "MAT-2025-24": { originalPrice: 35000, discountedPrice: 26250, discountPercent: 25 },
  // 20. Chauvet WELL-Fit Wireless LED Pars (4,500 ETB -> 3,600 ETB, 20% OFF)
  "MAT-2025-08": { originalPrice: 4500, discountedPrice: 3600, discountPercent: 20 },
  // 21. 350W BSW Moving Head Light (14,000 ETB -> 10,500 ETB, 25% OFF)
  "MAT-2025-27": { originalPrice: 14000, discountedPrice: 10500, discountPercent: 25 },
  // 22. Cold Spark Pyrotechnic Fountains (20,000 ETB -> 15,000 ETB, 25% OFF)
  "MAT-2025-28": { originalPrice: 20000, discountedPrice: 15000, discountPercent: 25 },
  // 23. Heavy Dry Ice Cloud Fogger (16,000 ETB -> 12,800 ETB, 20% OFF)
  "MAT-2025-29": { originalPrice: 16000, discountedPrice: 12800, discountPercent: 20 },
  // 24. P2.6 Indoor Concert LED Wall (180,000 ETB -> 135,000 ETB, 25% OFF)
  "MAT-2025-30": { originalPrice: 180000, discountedPrice: 135000, discountPercent: 25 },
  // 25. 10,000L 4K Laser Projector (65,000 ETB -> 48,750 ETB, 25% OFF)
  "MAT-2025-31": { originalPrice: 65000, discountedPrice: 48750, discountPercent: 25 },
  // 26. 24k Titanium Gold Cutlery Set (1,500 ETB -> 1,200 ETB, 20% OFF)
  "MAT-2025-36": { originalPrice: 1500, discountedPrice: 1200, discountPercent: 20 },
  // 27. Gold Wedding Ceremony Floral Arch (15,000 ETB -> 12,000 ETB, 20% OFF)
  "MAT-2025-41": { originalPrice: 15000, discountedPrice: 12000, discountPercent: 20 },
  // 28. 3D Faux Rose Flower Wall 8x8ft (28,000 ETB -> 19,600 ETB, 30% OFF)
  "MAT-2025-42": { originalPrice: 28000, discountedPrice: 19600, discountPercent: 30 },
  // 29. 45kVA Ultra-Quiet Whisper Diesel Generator (48,000 ETB -> 36,000 ETB, 25% OFF)
  "MAT-2025-46": { originalPrice: 48000, discountedPrice: 36000, discountPercent: 25 },
  // 30. Mojo Stage Crowd Barriers (6,500 ETB -> 4,875 ETB, 25% OFF)
  "MAT-2025-51": { originalPrice: 6500, discountedPrice: 4875, discountPercent: 25 },
};

export function getMaterialDeal(material: Material): DealInfo {
  // 1. Check if material already has explicit properties
  if (material.originalPriceETB && material.discountedPriceETB) {
    const orig = material.originalPriceETB;
    const disc = material.discountedPriceETB;
    const pct = material.discountPercentage || Math.round(((orig - disc) / orig) * 100);
    return {
      originalPrice: orig,
      discountedPrice: disc,
      discountPercent: pct,
      savingsAmount: orig - disc,
      currency: "ETB",
    };
  }

  // 2. Check curated overrides map
  const override = curatedDealOverrides[material.id];
  if (override) {
    return {
      originalPrice: override.originalPrice,
      discountedPrice: override.discountedPrice,
      discountPercent: override.discountPercent,
      savingsAmount: override.originalPrice - override.discountedPrice,
      currency: "ETB",
    };
  }

  // 3. Dynamic deterministic calculation based on actual pricing data
  const rawPrice = material.rentalPriceDaily || 10;
  const scaledPrice = rawPrice < 50 ? Math.round(rawPrice * 100) : Math.round(rawPrice * 10);
  
  // Deterministic discount percentage: 20%, 25%, or 30%
  const lastChar = material.id.slice(-1);
  const num = parseInt(lastChar, 10);
  const discountPercent = !isNaN(num) && num % 3 === 0 ? 30 : (!isNaN(num) && num % 2 === 0 ? 25 : 20);

  // Round original price cleanly to tens or hundreds
  const step = scaledPrice >= 1000 ? 100 : 10;
  const originalPrice = Math.round((scaledPrice / (1 - discountPercent / 100)) / step) * step;
  const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  const savingsAmount = originalPrice - discountedPrice;

  return {
    originalPrice,
    discountedPrice,
    discountPercent,
    savingsAmount,
    currency: "ETB",
  };
}
