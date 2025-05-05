// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "../../../src/ui/Carousel.js";
import "./styles.css";

export default function PropertyCard (props: Product)  {
  return (
    <div className="max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <img
        src={props.image_url}
        alt={props.image_url}
        className=" h-full object-cover"
      />
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Caracteristicas</h2>
        <p className="text-gray-600 mb-4">
          {/* {props.caracteristicas.map((caracteristica, index) => (
            <span key={index} className="block">{caracteristica}</span>
          ))} */}
          {props.caracteristicas.join(", ")}
        </p>
        <div className="text-green-600 font-bold text-lg">
          {props.moneda}{props.precio}
        </div>
        <div className="text-green-600 font-bold text-lg">
            <a target="_blank" href={props.url}>Ver Publicación</a>
        </div>
      </div>
    </div>
  );
};


export interface Product {
  agente: string;
  alrededores: string;
  banios: number;
  caracteristicas: string[];
  circunstancia: string;
  ciudad: string;
  cocina: string;
  codigo_postal: number;
  construccion_nueva: number;
  consumo_energia: number;
  direccion: string;
  dormitorios: number;
  emisiones: number;
  estado: string;
  estgen: string;
  fecha_alta: string;
  freq_precio: string;
  'geolocalizacion.latitude': number;
  'geolocalizacion.longitude': number;
  id: string | number; // Cambiado a string | number
  image_url: string;
  m2constr: number;
  m2terraza: number;
  m2utiles: number;
  moneda: string;
  nascensor: number;
  ntrasteros: number;
  num_inmueble: number | string; // Cambiado a number | string
  num_pisos_bloque: number | null; // Cambiado a number | null
  num_pisos_edificio: number | null; // Cambiado a number | null
  num_planta: string | null; // Cambiado a string | null
  num_terrazas: number | null; // Cambiado a number | null
  pais: string;
  piscina: number | null; // Cambiado a number | null
  precio: number | null; // Cambiado a number | null
  'propietario.apellido': string | null; // Cambiado a string | null
  'propietario.codigo': number | null; // Cambiado a number | null
  'propietario.comercial': string | null; // Cambiado a string | null
  'propietario.fecha_alta': string | null; // Cambiado a string | null
  'propietario.nombre': string | null; // Cambiado a string | null
  provincia: string;
  puerta?: any; // Se puede cambiar el tipo según sea necesario
  ref?: any; // Se puede cambiar el tipo según sea necesario
  'superficie.built'?: any; // Se puede cambiar el tipo según sea necesario
  'superficie.plot'?: any; // Se puede cambiar el tipo según sea necesario
  tipo: string;
  tipo_operacion: string;
  tipo_via: string;
  ubicacion: string;
  ventana: string;
  zona: string;
  url: string;
  [key: string]: any; // Permitir propiedades adicionales
}