// import  { useRef , useEffect , useState} from 'react';
import {Product} from './PropertyCard.js'
import PropertyCard from './PropertyCard.js';
import "./styles.css";

// import {
//     Carousel,
//     CarouselContent,
//     CarouselItem,
//     CarouselNext,
//     CarouselPrevious,
//   } from "../../../src/ui/Carousel.js";
// import "./styles.css";

// interface CarouselProps {
//         items: Product[];
//       }

/// Hook para media query
// function useMediaQuery(query: string): boolean {
//     const [matches, setMatches] = useState(false);
//     useEffect(() => {
//       const mql = window.matchMedia(query);
//       const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
//       setMatches(mql.matches);
//       mql.addEventListener('change', listener);
//       return () => mql.removeEventListener('change', listener);
//     }, [query]);
//     return matches;
//   }
  
//   interface CarouselProps {
//     items: Product[];
//   }
  
//   const ProductsCarousel: React.FC<CarouselProps> = (props:CarouselProps) => {
//     const isDesktop = useMediaQuery('(min-width: 768px)'); // md breakpoint
//     const itemsPerPage = isDesktop ? 3 : 1;
//     const pageCount = Math.ceil(props.items.length / itemsPerPage);
  
//     const [current, setCurrent] = useState(0);
//     const containerRef = useRef<HTMLDivElement>(null);
  
//     // Ajusta current si cambia itemsPerPage o cantidad
//     useEffect(() => {
//       if (current >= pageCount) {
//         setCurrent(pageCount - 1);
//       }
//     }, [pageCount, current]);
  
//     // Al cambiar current, desplazamos el contenedor
//     useEffect(() => {
//       if (containerRef.current) {
//         const offset = containerRef.current.clientWidth * current;
//         containerRef.current.style.transform = `translateX(-${offset}px)`;
//       }
//     }, [current]);
  
//     const handlePrev = () => setCurrent((idx) => Math.max(idx - 1, 0));
//     const handleNext = () => setCurrent((idx) => Math.min(idx + 1, pageCount - 1));
  
//     return (
//       <div className="max-w-full overflow-hidden relative">
//         {/* Contenedor slider */}
//         <div
//           ref={containerRef}
//           className="flex transition-transform duration-300 ease-in-out"
//           style={{ width: `${(props.items.length / itemsPerPage) * 100}%` }}
//         >
//           {props.items.map((product, idx) => (
//             <div
//               key={idx}
//               className={` p-2`}            
//               style={{ width: `${100 / props.items.length}%` }}
//             >
//               <PropertyCard {...product} />
//             </div>
//           ))}
//         </div>
  
//         {/* Flechas */}
//         <button
//           onClick={handlePrev}
//           disabled={current === 0}
//           className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
//         >
//           ‹
//         </button>
//         <button
//           onClick={handleNext}
//           disabled={current === pageCount - 1}
//           className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 z-10"
//         >
//           ›
//         </button>
  
//         {/* Paginación: puntos */}
//         <div className="flex justify-center space-x-2 mt-4">
//           {Array.from({ length: pageCount }).map((_, idx) => (
//             <button
//               key={idx}
//               onClick={() => setCurrent(idx)}
//               className={
//                 `w-2 h-2 rounded-full transition-colors ` +
//                 (idx === current ? 'bg-gray-800' : 'bg-gray-300')
//               }
//               aria-label={
//                 idx === current
//                   ? `Página ${idx + 1}, actual`
//                   : `Ir a página ${idx + 1}`
//               }
//             />
//           ))}
//         </div>
//       </div>
//     );
//   };

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'


interface Props {
  items: Product[]
}

const PropertyCarousel: React.FC<Props> = (props:Props) => {
  return (
    <div className="w-full max-[50%] overflow-x-hidden">
      <Swiper
      
        modules={[Pagination]}
        spaceBetween={8}
        slidesPerView={1}
        pagination={{ clickable: true }}
        breakpoints={{
          // a partir de 640px de ancho muestra 2 slides
          640: { slidesPerView: 2 },
          // a partir de 1024px muestra 3 slides
          1024: { slidesPerView: 3 },
        }}
        className="py-4"
        
      >
        {props.items.map((p) => (
          <SwiperSlide key={p.id}>
            <PropertyCard {...p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default PropertyCarousel
