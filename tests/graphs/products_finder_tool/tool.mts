import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
import { buildFilter } from "./helpers.mjs";
import { buildQueryFilterModel, embeddingModel } from "./models.mjs";
import { buildQuerySchema, INMUEBLE_PROPS } from "./schemas.mjs";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

dotenv.config();

const INDEX_NAME = "products";
const index = pinecone.Index(INDEX_NAME);

const props = INMUEBLE_PROPS;
const querySchema = buildQuerySchema(props);
const queryFilterModel = buildQueryFilterModel(querySchema);

const prompt = `busco una casa en venta con 2 baños, mas de 2 dormitorios y entre 100mil y 300mil euros`;
const rawQueryFilter = await queryFilterModel.invoke(prompt);
const filter = buildFilter(rawQueryFilter);
console.log({ filter });

const embeddedPrompt = await embeddingModel.embedQuery(prompt);
const result = await index.query({
  vector: embeddedPrompt,
  topK: 5,
  includeMetadata: true,
  filter,
});

console.log("result", result.matches);

// export const productsFinder = tool(
//   async ({ _state }: any) => {
//     console.log("State:", _state);

//     const props = INMUEBLE_PROPS;
//     const querySchema = buildQuerySchema(props);
//     const queryFilterModel = buildQueryFilterModel(querySchema);

//     try {
//       const prompt = `busco una casa en venta con 2 baños, mas de 2 dormitorios y entre 100mil y 300mil euros`;
//       const rawQueryFilter = await queryFilterModel.invoke(prompt);
//       const filter = buildFilter(rawQueryFilter);
//       console.log(rawQueryFilter);
//       console.log({ filter });

//       const embeddedPrompt = await embeddingModel.embedQuery(prompt);
//       const result = await index.query({
//         vector: embeddedPrompt,
//         topK: 5,
//         includeMetadata: true,
//         filter,
//       });

//       console.log({ result });

//       // return {
//       //   messages: [new AIMessage(mappedResult.join(""))],
//       // };

//       return "Lamentablemente no hay propiedades que cumplan con los requisitos que busca.";
//     } catch (error) {
//       return "Ocurrió un error interno al procesar la búsqueda de propiedades.";
//     }
//   },
//   {
//     name: "getProducts",
//     description: "Obtiene una lista de productos disponibles en el sistema",
//     schema: z.object({}),
//   },
// );
