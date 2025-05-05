import { tool } from "@langchain/core/tools";
import { ToolMessage } from "@langchain/core/messages";

// import { Product } from "../agent/ui.jsx";

import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { z } from "zod";
import { buildFilter } from "./helpers.mjs";
import { embeddingModel } from "./models.mjs";
import { buildQueryFilterModel, buildQuerySchema } from "./schemas.mjs";
import { workflow } from "../inmo.mjs";




dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const INDEX_NAME = "products";
const index = pinecone.Index(INDEX_NAME);

const findProducts = async (prompt: string, props: string[]) => {
  const querySchema = buildQuerySchema(props);
  const queryFilterModel = buildQueryFilterModel(querySchema);
  const rawQueryFilter = await queryFilterModel.invoke(prompt);
 

  const filter = buildFilter(rawQueryFilter);
  const embeddedPrompt = await embeddingModel.embedQuery(prompt);
  const result = await index.query({
    vector: embeddedPrompt,
    topK: 5,
    includeMetadata: true,
    filter,
  });

  return result.matches;
};

const BASE_URL = "https://propiedades.winwintechbank.com/#/producto";
const buildUrl = (id: string | number) => `${BASE_URL}/${id}`;

export const productsFinder = tool(
  async ({ prompt, props }, config) => {
    const state = await workflow.getState({
      configurable: { thread_id: config.configurable.thread_id },
    });
    // const message_id = state.values.messages.at(-1).id
    const toolCallId = state.values.messages.at(-1).tool_calls[0].id;
   
    // const ui = typedUi<typeof ComponentMap>(config);

    try {
      const rawProducts = await findProducts(prompt, props);
      const products = rawProducts.map((product) => ({
        ...product.metadata,
        id: product.id,
        url: buildUrl(product.id),
      }));
      
      
      
      if (!products) {
        return "No se encontraron productos que coincidan con tu búsqueda.";
      } else {
       
    
      return {item: products , message: new ToolMessage(`${products.length > 1 ? "He encontrado estas propiedades" : "He encontrado está propiedad"}`, toolCallId, "products_finder")}
    

      }


      // // Emit UI elements associated with the AI message
    } catch (error) {
      return "Ocurrió un error interno al procesar la búsqueda de productos.";
    }
  },
  {
    name: "products_finder",
    description: "Obtiene una lista de productos disponibles en el sistema",
    schema: z.object({
      prompt: z
        .string()
        .describe("Consulta del usuario sobre el producto buscado"),
      props: z
        .array(z.string())
        .describe("Atributos del producto que se pueden filtrar"),
    }),
  },
);

// const product =  {
//   agente: 'M&M .',
//   alrededores: 'Bus:\nTren:\nRestaurantes:\nAeropuerto:',
//   banios: 1,
//   caracteristicas: [
//     'Planta 1',
//     'Aparcamiento',
//     'Terraza',
//     'Buen Estado',
//     'Comunidad:  0',
//     'Ventanas: Aluminio',
//     'Cocina: Independiente',
//     'Ubicación: Céntrico'
//   ],
//   circunstancia: 'No Disponible',
//   ciudad: 'Gava',
//   cocina: 'Independiente',
//   codigo_postal: 8850,
//   construccion_nueva: 0,
//   consumo_energia: 0,
//   direccion: 'Calle Sarria, 11, puerta 2',
//   dormitorios: 3,
//   emisiones: 0,
//   estado: 'No Disponible',
//   estgen: 'Buen Estado',
//   fecha_alta: '2024-04-26 00:00:00',
//   freq_precio: 'sale',
//   'geolocalizacion.latitude': 41.30558,
//   'geolocalizacion.longitude': 2.00845,
//   id: '1985',
//   image_url: 'https://crm904.inmopc.com/INMOWEB-PHP/base/fotos/inmuebles/98475/9847513104_5.jpg',
//   m2constr: 0,
//   m2terraza: 0,
//   m2utiles: 82,
//   moneda: 'EUR',
//   nascensor: 0,
//   ntrasteros: 0,
//   num_inmueble: 11,
//   num_pisos_bloque: 0,
//   num_pisos_edificio: 0,
//   num_planta: '1ª Planta',
//   num_terrazas: 1,
//   pais: 'spain',
//   piscina: 1,
//   precio: 208000,
//   'propietario.apellido': 'David',
//   'propietario.codigo': 51,
//   'propietario.comercial': 'M&M .',
//   'propietario.fecha_alta': '03/11/2023',
//   'propietario.nombre': 'Maria',
//   provincia: 'Barcelona',
//   puerta: 2,
//   ref: 3092,
//   'superficie.built': 0,
//   'superficie.plot': 0,
//   tipo: 'piso',
//   tipo_operacion: 'Venta',
//   tipo_via: 'Calle',
//   ubicacion: 'Céntrico',
//   ventana: 'Aluminio',
//   zona: 'Centre',
//   url: 'https://propiedades.winwintechbank.com/#/producto/1985'
// }
// console.log(product);
