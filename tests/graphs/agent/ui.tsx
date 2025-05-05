
import PropertyCard from "./PropertyCard.js";
import ProductsCarousel from "./ProductCarousel.js";

const ComponentMap = {
  "property-card": PropertyCard,
  "products-carousel": ProductsCarousel,
  
} as const;

export default ComponentMap;

