
import "./styles.css";

const PropertyCard: React.FC<Product> = (props:Product) => {
  return (
    <div className="max-w-[80%] px-6  bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 mx-2">
    <img
        src={"https://media.ambito.com/p/0d7dcb42b3f914aa1a1dced3b943dfdc/adjuntos/239/imagenes/041/278/0041278247/inmobiliariajpg.jpg"}
        alt={props.direccion}
        className="h-48 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">
          {props.ciudad}, {props.zona}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {props.direccion}
        </p>
        <div className="text-green-600 font-bold text-lg mb-2">
          {props.moneda}{props.precio}
        </div>
        <div>
          Baños: {props.banios} | Dormitorios: {props.dormitorios} |{" "}
          Superficie: {props.m2utiles} m² | {props.tipo}
          piscina: {props.piscina ? "Sí" : "No"}
        </div>
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm"
        >
          Ver publicación
        </a>
      </div>
    </div>
  )
}

export default PropertyCard

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