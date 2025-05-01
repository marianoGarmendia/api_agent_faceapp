// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
import fs from "fs/promises";

// import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";

// import { ToolMessage } from "@langchain/core/messages";

// import {
//   ActionRequest,
//   HumanInterruptConfig,
//   HumanInterrupt,
//   HumanResponse,
// } from "@langchain/langgraph/prebuilt";
// import { interrupt } from "@langchain/langgraph";

import { tool } from "@langchain/core/tools";
import { z } from "zod";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";
import dotenv from "dotenv";
dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // import { join } from 'path';

// const rutaArchivo = path.join(__dirname, "Presentacion_UA_2025.pdf");

// const loader = new PDFLoader(rutaArchivo);

// const docs = await loader.load();

// const embeddings = new OpenAIEmbeddings({
//   model: "text-embedding-3-small",

//   apiKey: process.env.OPENAI_API_KEY,
// });

// const llmGroq = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0,
//   maxTokens: undefined,
//   maxRetries: 2,
//   // other params...
// });

export const pdfTool = tool(
  async ({ query }) => {
    // const vectorStore = new MemoryVectorStore(embeddings);
    // await vectorStore.addDocuments(docs);
    // const retriever = vectorStore.asRetriever({
    //   k: 5,
    // });
    // const docsFound = await retriever.invoke(query);
    // console.dir(docsFound, { depth: null });
    // const content = docsFound.map((doc) => doc.pageContent);
    // const texto = content.join(" ");
    // return texto;
  },
  {
    name: "universal_info_2025",
    description:
      "Obtiene informacion de Universal Assistance actualizada de 2025",
    schema: z.object({
      query: z
        .string()
        .describe(
          "Consulta a realizar sobre el contenido del documento que contiene la informacion de Universal Assistance 2025",
        ),
    }),
  },
);

// const tavilySearch = new TavilySearchResults({
//   apiKey: process.env.TAVILY_API_KEY,
// });

// Herramienta de simulacion de Cotizacion de viajes

export const cotizacion = tool(
  async ({ destino, fecha, pasajeros }) => {
    const prompt = `
    

    - Simula una cotizacion de asistencia de viaje de Universl assistance para ${pasajeros} pasajeros en la fecha ${fecha} con destino a ${destino}
    - La respuesta debe ser una simulacion de cotizacion de asistencia de viaje
    ejemplo: 
    "Cotizacion de asistencia de viaje para ${pasajeros} pasajeros en la fecha ${fecha} con destino a ${destino}..."

    ### NO BRINDES NINGUN ENLACE EN LA RESPUESTA NI INFORMACION DE OTRA EMPRESA QUE NO SEA UNIVERSAL ASSISTANCE

    
  `;
    const response = await model.invoke(prompt);
    return response.content;
  },
  {
    name: "cotizacion_de_asistencia_de_viaje",
    description: "Simula una cotizacion de asistencia",
    schema: z.object({
      destino: z.string().describe("Destino del viaje"),
      fecha: z.string().describe("Fecha de inicio del viaje"),
      pasajeros: z.number().describe("Cantidad de pasajeros"),
    }),
  },
);

// Herramienta que simula sobre la cobertura vigente del usuario que consulta

export const mi_cobertura = tool(
  async ({ tipo_de_documento, documento }, runContext) => {
    // Accede al tool_call_id desde runContext

    const response = `
    esta es una respuesta simulada sobre una cobertura de un usuario.
    consulta la cobertura vigente para el documento ${tipo_de_documento} ${documento}

    respuesta: 
    ✅ Listo, he encontrado tu cobertura. Según los datos ingresados, actualmente cuentas con el Plan Excellence.

🔹 Detalles de tu cobertura:

Asistencia médica internacional hasta USD 150,000.
Cobertura por COVID-19 incluida.
Reintegro por medicamentos ambulatorios en caso de enfermedad o accidente.
Asistencia en caso de preexistencias hasta un límite específico.
Cobertura en deportes recreativos, por si practicas actividades al aire libre.
Acceso a teleasistencia médica 24/7 para consultas rápidas.
Servicio VIP Delay, que te ofrece acceso a salas VIP en caso de retraso en tu vuelo.
📌 Información adicional:
Tu cobertura está activa desde el 10 de marzo de 2025 y tiene vigencia hasta el 10 de abril de 2025.

Si necesitas más información sobre algún beneficio en particular o deseas realizar cambios en tu cobertura, dime cómo puedo ayudarte. 😊








  `;

    return response;
  },
  {
    name: "mi_cobertura",
    description: "Consulta sobre la cobertura vigente del usuario",
    schema: z
      .object({
        documento: z.string().describe("Documento del usuario"),
        tipo_de_documento: z.string().describe("Tipo de documento del usuario"),
      })
      .describe("Consulta sobre la cobertura vigente del usuario"),
  },
);

const url =
  "https://propiedades_test.techbank.ai:4002/public/productos?limit=100";

// const getPisos = tool(
//   async ({
//     habitaciones,
//     precio_aproximado,
//     zona,
//     piscina,
//     superficie_total,
//   }) => {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`Error: ${response.statusText}`);
//     }
//     let pisos_found: any[] = [];
//     const pisos = await response.json();
//     pisos.forEach((piso:any) => {
//       const props = piso.PRODUCT_PROPS;
//       pisos_found.push(props);
//     });

//     const cadenaJson = JSON.stringify(pisos_found);
//     const prompt2 = `Segun los siguientes parametros: ${habitaciones} habitaciones, - $${precio_aproximado} precio aproximado, zona:  ${zona} , piscina: ${piscina} , ${superficie_total} superficie total, dame una lista de propiedades disponibles en el sistema.
//         Estos son todos los pisos encontrados:

//         ${cadenaJson}

//         ### INSTRUCCIONES DE RESPUESTA:
//         - Si no encontras una propiedad que cumpla con los 5 los requisitos, sugiere una propiedad que cumpla con 4 requisitos
//         - Si no encontras una propiedad que cumpla con 4 requisitos, sugiere una propiedad que cumpla con 3 requisitos
//         - Si no encontras una propiedad que cumpla con 3 requisitos, sugiere una propiedad que cumpla con 2 requisitos
//         - Si no encontras una propiedad que cumpla con 2 requisitos, sugiere una propiedad que cumpla con 1 requisito
//         - Si no encontras una propiedad que cumpla con 1 requisito, dile que por el momento no hay propiedades disponibles segun sus requisitos

//         - El precio de la propiedad no puede estar alejado del precio aproximado que el usuario ha solicitado ( unos 10% de diferencia maximo)
//         - la superficie total no puede estar alejada de la superficie total que el usuario ha solicitado ( unos 10% de diferencia maximo)
//         - la cantidad de habitaciones no puede estar alejada de la cantidad de habitaciones que el usuario ha solicitado ( unos 10% de diferencia maximo)
//         - la zona no puede estar alejada de la zona que el usuario ha solicitado ( unos 10 km maximo)

//         Evalua los requisitos y responde con la propiedad mas acorde a los requisitos que el usuario ha solicitado, si no hay propiedades disponibles, responde que no hay propiedades disponibles segun sus requisitos.

//         `;

//     const res = await model.invoke(prompt2);

//     console.log("res: ", res.content);

//     return res.content;
//   },
//   {
//     name: "Obtener_pisos_en_venta",
//     description: "Obtiene una lista de propiedades disponibles en el sistema",
//     schema: z.object({
//       habitaciones: z
//         .string()
//         .describe("Numero de habitaciones de la propiedad"),
//       precio_aproximado: z
//         .string()
//         .describe("Precio aproximado de la propiedad"),
//       zona: z.string().describe("Zona de la propiedad"),
//       superficie_total: z
//         .string()
//         .describe("Superficie total de la propiedad que busca"),
//       piscina: z
//         .string()
//         .describe("Si busca piscina o no, la palabra de ser si o no"),
//     }),
//   }
// );

export const InmuebleSchema = z.object({
  banios: z.number().nullable(),
  construccion_nueva: z.number().nullable(),
  dormitorios: z.number().nullable(),
  m2constr: z.number().nullable(),
  m2terraza: z.number().nullable(),
  m2utiles: z.number().nullable(),
  nascensor: z.number().nullable(),
  num_terrazas: z.number().nullable(),
  piscina: z.number().nullable(),
  precio: z.number().nullable(),
});

// const objetoMongoPorperties = {
//   agente: "M&M .",

//   alrededores:
//     "Bus:\nTren:\nPolideportivo:\nParque Público:\nZona Comercial:\nPuerto Deportivo:\nCampo de Fútbol:\nPiscina Pública:\nUniversidad:\nGimnasio:\nEscuela Internacional:\nEscuela Pública:\nGuardería:\nRestaurantes:\nHotel:\nHospital:\nAeropuerto:\nCentro Comercial:\nBancos:\nColegios:\nBiblioteca:\nBuen acceso a carretera:\nCercano al pueblo:",

//   amueblado: "Completamente Amueblado",

//   banios: 0,

//   caracteristicas: [
//     "Planta 3",
//     "Jardin",
//     "2da. Mano",
//     "Buen Estado",
//     "Comunidad: 0",
//     "Climatización: a/a f/c",
//     "Ventanas: Aluminio",
//     "Agua caliente: Gas Natural",
//     "Cocina: Independiente",
//     "Ubicación: Playa - 1ª Línea",
//   ],

//   circunstancia: "No Disponible",

//   ciudad: "Gava",

//   climatizacion: "a/a f/c",

//   cocina: "Independiente",

//   codigo_postal: 8850,

//   construccion_nueva: 0,

//   direccion: "Calle Blanes, 1",

//   dormitorios: 0,

//   emisiones: 0,

//   estado: "No Disponible",

//   estgen: "Buen Estado",

//   fecha_alta: "2024-01-11 00:00:00",

//   freq_precio: "month",

//   "geolocalizacion.latitude": 41.268378,

//   "geolocalizacion.longitude": 2.026464,

//   id: 3121,

//   m2constr: 125,

//   m2terraza: 14,

//   m2utiles: 90,

//   moneda: "EUR",

//   nascensor: 0,

//   ntrasteros: 0,

//   num_inmueble: 1,

//   num_pisos_bloque: 0,

//   num_pisos_edificio: 0,

//   num_planta: "3ª Planta",

//   num_terrazas: 0,

//   pais: "spain",

//   piscina: 1,

//   precio: 2700,

//   "propietario.apellido": "Llauradó",

//   "propietario.codigo": 68,

//   "propietario.comercial": "M&M .",

//   "propietario.fecha_alta": "15/12/2023",

//   "propietario.nombre": "Josep",

//   "propietario.telefono_movil": 636972777,

//   provincia: "Barcelona",

//   puerta: 0,

//   ref: 3109,

//   situacion: "2da. Mano",

//   "superficie.built": 125,

//   "superficie.plot": 0,

//   tipo: "apartamento",

//   tipo_operacion: "Alquiler",

//   tipo_via: "Calle",

//   ubicacion: "Playa - 1ª Línea",

//   ventana: "Aluminio",

//   zona: "Gava Mar",

//   zonascomunes: "Baloncesto:\nCentro de ocio:",
// };

const model = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.6,


});



// const modelStructured = model.withStructuredOutput(InmuebleSchema);

// const query = `Hola, busco un piso de mas de 2 dormitorios, con piscina, de un valor entre 100 mil y 170 mil euros, en la zona de Gava Mar, que no tenga menos de 230 m2 construidos y que sea de nueva construccion, y si tiene terraza mejor, pero no es necesario.`;

// const prompt = `Segun la siguiente consulta del ususario dame una respuesta estructurada segun el schema indicado.

// CONSULTA DEL USUARIO: ${query}

// ### INSTRUCCIONES DE RESPUESTA:
// - LOS VALORES QUE NO TE BRINDE EL USUARIO DEBES DEJARLOS EN NULL
// - NO COMPLETES CAMPOS SIN INFORMACIÓN DEL USUARIO

// `;

// const responseStructured = await modelStructured.invoke(prompt);

// const AtributoSchema = z.enum([
//   "construccion_nueva",
//   "dormitorios",
//   "banios",
//   "m2constr",
//   "m2terraza",
//   "m2utiles",
//   "nascensor",
//   "num_terrazas",
//   "piscina",
//   "precio",
// ]);

// Definimos los operadores permitidos directamente como un conjunto de literales


const CondicionSchema = z.object({
  
  "$eq": z.number().nullable().describe("completar solo si el valor es exacto"),
  "$gt": z.number().nullable().describe("completar solo si detectas que debe ser mayor que"),
  "$lt": z.number().nullable().describe("completar solo si detectas que debe ser menor que"),
  "$gte": z.number().nullable().describe("completar solo si detectas que debe ser mayor o igual que"),
  "$lte": z.number().nullable().describe("completar solo si detectas que debe ser menor o igual que"),
}).partial();

// Objeto completo con claves explícitas
const QuerySchema = z.object({
  edad_permitida: CondicionSchema.partial().describe("edad permitida para ingresar"),

  
});



const modelQuerySchema = model.withStructuredOutput(QuerySchema,{
strict: true,
});

const promptQuerySchema = `
Segun la informacion brindada por el usuario, genera la salida estructurada en el formato indicado, ### REGLA ESTRICTA:
- nO ES NECESARIO QUE INCLUYAS TODOS LOS CAMPOS SI NO TIENES INFORMACION DADA POR DEL USUARIO

QUERY DEL USUARIO: "solo pueden ingresar con mas de 18 años"
`

const responseQuerySchema = await modelQuerySchema.invoke(promptQuerySchema);

console.log("responseQuerySchema: ", responseQuerySchema);
console.log("type: ",typeof responseQuerySchema);





// const promptQueryMongo = `
//      ' Eres un agente generador de filtros en el formato que usa MongoDB. Sigue en forma estricta las siguientes instrucciones al generar los filtros:'
//     '- Incluye únicamente los metadatos que se encuentren en la query y que se correlacionen con alguno de lista siguiente:" + ", ".join(interface["keys"]) +
//     "- Utiliza exclusivamente los siguientes operadores:" + ", ".join(interface["operators"]) + ". No uses otros operadores."
//     "- Siempre que la query incluya cantidades, usa los operadores de comparación adecuados para cada tipo de dato. Por ejemplo, si la query incluye números, usa $gt, $lt, o $eq"
//     '- Nunca compares con booleanos (True, False). En su lugar usa $gt 0 si el atributo existe."
//     '- Siempre devuelve un diccionario serializado, sin incluir el formato. Nada más.'

//     Keys validos = "banios",
//                     "construccion_nueva",
//                     "dormitorios",
//                     "m2constr",
//                     "m2terraza",
//                     "m2utiles",
//                     "nascensor",
//                     "num_terrazas",
//                     "piscina",
//                     "precio",
    
//     Consulta del usuario: ${query}
//     `;

// const responseQuery = await model.invoke(promptQueryMongo);

// console.log("responseQuery: ", responseQuery.content);

// reponse:
// ```json
// {
//     "dormitorios": {"$gt": 2},
//     "piscina": {"$gt": 0},
//     "precio": {"$gt": 100000, "$lt": 170000},
//     "m2constr": {"$gt": 230},
//     "construccion_nueva": {"$gt": 0}
// }
// ```

// console.log("tipo: ", typeof responseQuery.content);

// const parsedQuery = JSON.parse(responseQuery.content as string);

// console.log("parsedQuery: ", parsedQuery);



// console.log("tipo parseado: ", typeof parsedQuery);

// const queryMongo = [
// { $and: [ { edad: { $gt: 30 } }, { nombre: { $eq: "Juan" } } ] },

// { $or: [ { precio: { $lte: 100 } }, { categoria: { $eq: "oferta" } } ] },

// { $or: [ { $and: [ { cantidad: { $gte: 10 } }, { total: { $lt: 500 } } ] }, { estado: { $eq: "pendiente" } } ] }]

export const getPisos2 = tool(
  async ({
    habitaciones,
    precio_aproximado,
    zona,
    piscina,
    superficie_total,
    tipo_operacion,
  }) => {
    console.log("Obteniendo pisos...");
    console.log(
      habitaciones,
      precio_aproximado,
      zona,
      piscina,
      superficie_total,
    );

    try {
      // Validación de zona
      if (!zona || zona.trim().length < 2) {
        return "Por favor, proporciona una zona válida con al menos 2 caracteres.";
      }

      // Validación precio
      const precioInput = Number(precio_aproximado);
      if (isNaN(precioInput)) {
        return "El precio aproximado debe ser un número válido.";
      }
      const precioMin = precioInput * 0.9;
      const precioMax = precioInput * 1.1;

      // Validación de superficie
      const superficieInput = superficie_total
        ? Number(superficie_total)
        : null;
      const superficieMin = superficieInput ? superficieInput * 0.7 : null;
      const superficieMax = superficieInput ? superficieInput * 1.2 : null;

      const response = await fetch(url);
      if (!response.ok) {
        return "Hubo un error al consultar las propiedades. Por favor, intenta nuevamente.";
      }

      const pisos = await response.json();

      await fs.writeFile("pisos.json", JSON.stringify(pisos, null, 2), "utf-8");

      const pisos_filtrables = pisos
        .map((p: any) => p.PRODUCT_PROPS)
        .filter((p: any) => {
          const estado_ok = p.estado?.toLowerCase() !== "no disponible";
          const operacion_ok =
            p.tipo_operacion?.toLowerCase() === tipo_operacion.toLowerCase();
          return estado_ok && operacion_ok;
        });

      const pisosPuntuados = pisos_filtrables.map((piso: any) => {
        let score = 0;

        // Habitaciones
        if (!habitaciones) {
          score++;
        } else {
          const pedidas = Number(habitaciones.trim());
          const disponibles = Number(piso.dormitorios?.trim());
          if (disponibles === pedidas || disponibles === pedidas + 1) score++;
        }

        // Zona
        const zonaInput = zona.toLowerCase().trim();
        const ubicaciones = [piso.zona, piso.ciudad, piso.provincia, piso.pais];
        if (ubicaciones.some((u) => u?.toLowerCase().includes(zonaInput)))
          score++;

        // Piscina
        if (!piscina) {
          score++;
        } else if (piscina === "si" ? piso.piscina === "1" : true) {
          score++;
        }

        // Precio
        let precio = 0;
        try {
          const precioStr = piso.precio?.toString().replace(/\s/g, "") || "";
          precio = Number(precioStr);
        } catch {}
        if (precio >= precioMin && precio <= precioMax) score++;

        // Superficie
        const sup = piso.m2constr ? Number(piso.m2constr.toString().trim()) : 0;
        if (
          !superficie_total ||
          (sup >= superficieMin! && sup <= superficieMax!)
        ) {
          score++;
        }

        return { piso, score };
      });

      for (let minScore = 5; minScore >= 2; minScore--) {
        const matches = pisosPuntuados
          .filter(({ score }: { score: any }) => score === minScore)
          .map(({ piso }: { piso: any }) => piso);

        if (matches.length > 0) {
          return matches
            .map((p: any) => {
              return `
            Ciudad: ${p.ciudad || "Sin dato"}
            Ubicación: ${p.ubicacion || p.zona || "Sin dato"}
            Dormitorios: ${p.dormitorios || "Sin dato"}
            Baños: ${p.banios || "Sin dato"}
            Metros construidos: ${p.m2constr?.trim() || "Sin dato"} m²
            Antigüedad: ${p.antiguedad || "Sin dato"}
            Precio: ${p.precio ? `${p.precio} €` : "Sin dato"}
            Descripción: ${p.descripcion?.slice(0, 200).trim() || "Sin descripción"}...
            Características: ${
              Array.isArray(p.caracteristicas)
                ? p.caracteristicas.join(", ")
                : "Sin dato"
            }
              `.trim();
            })
            .join("\n\n---------------------\n\n");
        }
      }

      return "Lamentablemente no hay propiedades que cumplan con los requisitos que busca.";
    } catch (error) {
      console.error("Error en getPisos2:", error);
      return "Ocurrió un error interno al procesar la búsqueda de propiedades.";
    }
  },
  {
    name: "Obtener_pisos_en_venta_dos",
    description: "Obtiene una lista de propiedades disponibles en el sistema",
    schema: z.object({
      habitaciones: z
        .string()
        .regex(/^\d+$/, "Debe ser un número entero en formato texto")
        .nullable()
        .describe("Número exacto de habitaciones que desea la persona"),

      precio_aproximado: z
        .string()
        .regex(
          /^\d+$/,
          "Debe ser un número aproximado sin símbolos ni decimales",
        )
        .describe("Precio aproximado de la propiedad en euros (ej: '550000')"),

      zona: z
        .string()
        .min(2, "La zona debe tener al menos 2 caracteres")
        .describe("Zona o localidad donde desea buscar la propiedad"),

      superficie_total: z
        .string()
        .regex(/^\d+$/, "Debe ser un número aproximado en m2")
        .nullable()
        .describe("Superficie total del terreno de la propiedad en m²"),

      piscina: z
        .enum(["si", "no"])
        .nullable()
        .describe("Indica si desea piscina: 'si' o 'no'"),

      tipo_operacion: z
        .enum(["venta", "alquiler"])
        .describe("Indica si busca una propiedad en 'venta' o en 'alquiler'"),
    }),
  },
);
