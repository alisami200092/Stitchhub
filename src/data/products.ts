import { Product } from "../types";

export const catalog: Product[] = [
  {
    id: "gildan-18500-hoodie",
    title: "Gildan 18500 Hoodie",
    cat: "Apparel (Hoodie, Polo)",
    img: "/images/products/apparel/hoodie.webp",
    price: 39.99, 
    priceRange: "$14.20 - $22.50", 
    description: "Heavyweight 8.0 oz cotton blend fleece featuring double-needle stitching, double-lined hood with dyed-to-match drawcord. Highly durable and optimized for screen printing or embroidery.",
    moq: 25,
    customization: "Screen Print | Embroidery"
  },
  {
    id: "matte-black-tumbler",
    title: "Matte Black Tumbler",
    cat: "Drinkware (Tumblers)",
    img: "/images/products/drinkware/tumbler.webp",
    price: 19.99,
    priceRange: "$8.50 - $12.99",
    description: "Double-wall vacuum insulated stainless steel tumbler. Keeps drinks cold for 24 hours or hot for 12 hours. Matte powder-coat finish ideal for clean laser engraving.",
    moq: 50,
    customization: "Laser Engraved"
  },
  {
    id: "under-armour-polo",
    title: "Under Armour Polo",
    cat: "Apparel (Hoodie, Polo)",
    img: "/images/products/performance/polo.webp",
    price: 29.99,
    priceRange: "$16.80 - $24.00",
    description: "High-performance tech fabric engineered for breathability and rapid drying. Anti-odor technology prevents the growth of odor-causing microbes. Perfect for premium corporate branding.",
    moq: 25,
    customization: "Embroidery | Heat Transfer"
  },
  {
    id: "tech-organizer",
    title: "Tech Organizer",
    cat: "Gear (Organizer Pouches)",
    img: "/images/products/accessories/pouch.webp",
    price: 14.99,
    priceRange: "$5.20 - $9.50",
    description: "Water-resistant woven fabric organizer with elastic loops, zip pockets, and segmented compartments. Sleek solution to keep cords, chargers, and tech accessories secure on the go.",
    moq: 50,
    customization: "High-Fidelity Embroidery"
  },
  {
    id: "quarter-zip-windbreaker",
    title: "Quarter-Zip Windbreaker",
    cat: "Apparel (Hoodie, Polo)",
    img: "/images/products/performance/windbreaker.webp",
    price: 49.99,
    priceRange: "$22.00 - $31.50",
    description: "Ultra-lightweight packable ripstop wind shell. Wind and water resistant with adjustable drawcord hem. Ideal for outdoor training or rugged lifestyle events.",
    moq: 25,
    customization: "Screen Print | Embroidery"
  },
  {
    id: "thermo-insulated-flask",
    title: "Thermo Insulated Flask",
    cat: "Drinkware (Tumblers)",
    img: "/images/products/drinkware/flask.webp",
    price: 27.99,
    priceRange: "$12.50 - $18.00",
    description: "Premium grade 18/8 stainless steel construction featuring leakproof loop cap. Designed to withstand demanding B2B shipping schedules and active usage.",
    moq: 50,
    customization: "Laser Engraved | Screen Print"
  },
  {
    id: "stitch-hub-heavyweight-hoodie",
    title: "Premium Heavyweight Hoodie (Stitch Hub Original)",
    cat: "Apparel (Hoodie, Polo)",
    img: "/images/products/apparel/premium_heavyweight_hoodie.webp",
    price: 49.99, 
    priceRange: "$24.50 - $39.99", 
    description: "Super heavyweight premium fleece designed for maximum comfort and structure. Perfect for casual corporate wear and high-end brand merchandising.",
    moq: 50,
    customization: "Screen Print | Puff Print | Chest Embroidery"
  },
  {
    id: "stitch-hub-corporate-polo",
    title: "Minimalist Corporate Polo (Stitch Hub Original)",
    cat: "Apparel (Hoodie, Polo)",
    img: "/images/products/apparel/corporate_polo.webp",
    price: 34.99,
    priceRange: "$18.00 - $28.50",
    description: "Sleek, structured polo featuring premium knit collar and cuffs. Tailored specifically for modern uniforming and formal corporate gifting.",
    moq: 50,
    customization: "Precision Embroidery"
  },
  {
    id: "stitch-hub-insulated-tumbler",
    title: "Insulated Matte Tumbler (Stitch Hub Original)",
    cat: "Drinkware (Tumblers)",
    img: "/images/products/drinkware/matte_tumbler.webp",
    price: 22.99,
    priceRange: "$9.99 - $14.99",
    description: "Double-wall vacuum insulated tumbler with a rich matte hardware finish. Supports 360° cylindrical rotary printing or ultra-clean laser engraving.",
    moq: 50,
    customization: "Rotary Print | Laser Engraved"
  },
  {
    id: "stitch-hub-tech-organizer",
    title: "EDC Tech Organizer Pouch (Stitch Hub Original)",
    cat: "Gear (Organizer Pouches)",
    img: "/images/products/accessories/tech_organizer.webp",
    price: 19.99,
    priceRange: "$8.00 - $12.50",
    description: "Tactical and functional EDC tech pouch with complex fabric textures, elastic loops, and zip pockets. Ideal for carrying cables, power banks, and cards.",
    moq: 50,
    customization: "Rubber Patch | Woven Label | Heat Transfer"
  },
  {
    id: "stitch-hub-acoustic-panel",
    title: "Framed Acoustic Art Panel (Stitch Hub Original)",
    cat: "Office (Acoustic Panels)",
    img: "/images/products/accessories/acoustic_panel.webp",
    price: 89.99,
    priceRange: "$45.00 - $69.00",
    description: "Interior tech-office acoustic panels featuring premium sound dampening insulation, wrapped in custom full-bleed digital canvas with sleek framing options.",
    moq: 50,
    customization: "Full-Bleed Digital Print | Custom Color Frame"
  },
  {
    id: "cordura-ballistic-briefcase",
    title: "Cordura Ballistic Tech Briefcase",
    cat: "Gear (Luggage & Briefcases)",
    img: "/images/products/accessories/tech_organizer.webp",
    price: 89.99,
    priceRange: "$48.00 - $89.99",
    description: "Heavy military-grade woven nylon briefcase engineered for extreme durability. Approved for laser-engraved matte black metal plates or high-density silicone prints. (Direct fine embroidery strictly forbidden due to fabric tearing risks).",
    moq: 50,
    customization: "Laser-Engraved Metal Plates | High-Density Silicone Prints"
  },
  {
    id: "merino-wool-desk-mat",
    title: "Natural Merino Wool Desk Mat",
    cat: "Office (Deskware)",
    img: "/images/products/accessories/acoustic_panel.webp",
    price: 34.99,
    priceRange: "$18.50 - $34.99",
    description: "Pressed organic Merino wool felt providing a premium workspace layer. Approved for sewn full-grain leather accent patches or clean laser-etched branding. (Surface ink printing or heat-press methods forbidden).",
    moq: 50,
    customization: "Sewn Leather Patches | Laser-Etched Branding"
  },
  {
    id: "waxed-canvas-duffel",
    title: "Rugged Waxed Canvas Weekend Duffel",
    cat: "Travel (Duffel Bags)",
    img: "/images/products/accessories/pouch.webp",
    price: 79.99,
    priceRange: "$42.00 - $79.99",
    description: "Heavyweight water-resistant waxed cotton canvas travel duffel. Approved for debossed genuine leather labels or heavyweight stitched cotton webbing patches. (Waxed coating prevents screen printing ink adhesion or heat-press setting).",
    moq: 50,
    customization: "Debossed Leather Labels | Stitched Cotton Webbing Patches"
  },
  {
    id: "magsafe-matte-wallet",
    title: "Minimalist MagSafe Matte Aluminum Wallet",
    cat: "Gear (EDC Wallets)",
    img: "/images/products/accessories/tech_organizer.webp",
    price: 29.99,
    priceRange: "$15.00 - $29.99",
    description: "Precision CNC-machined aerospace-grade aluminum cardholder with integrated MagSafe and RFID-blocking core. Approved for high-precision fiber laser marking and deep diamond engraving. (Surface multi-color printing rejected).",
    moq: 50,
    customization: "Fiber Laser Marking | CNC Diamond Engraving"
  },
  {
    id: "leather-loop-keychain",
    title: "Full-Grain Leather Hardware Loop Keychain",
    cat: "Gear (EDC Keychains)",
    img: "/images/products/accessories/pouch.webp",
    price: 14.99,
    priceRange: "$6.50 - $14.99",
    description: "Multi-surface hybrid EDC accessory combining vegetable-tanned full-grain leather and stainless steel hardware rings. Approved for deep blind debossing and laser-etched hardware rings (requires dual setup pricing).",
    moq: 50,
    customization: "Blind Debossing (Leather) | Laser-Etched Hardware Rings"
  }
];