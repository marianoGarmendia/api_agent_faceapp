import { ChatOpenAI } from "@langchain/openai";
// import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
import { fromPairs, values } from "lodash-es";

dotenv.config();

const model = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});

// const url =
//   "https://propiedades_test.techbank.ai:4002/public/productos?limit=100";

const PROPS = [
  "banios",
  "dormitorios",
  "m2constr",
  "m2terraza",
  "m2utiles",
  "nascensor",
  "num_terrazas",
  "piscina",
  "precio",
];
const OPERATORS = ["$eq", "$gt", "$lt", "$gte", "$lte"] as const;

// const CondicionSchema = z
//   .object(fromPairs(OPERATORS.map((op) => [op, z.number().nullable()])))

const CondicionSchema = z.object({
  operator: z.enum(OPERATORS),
  value: z.number().nullable(),
});

const QuerySchema = z
  .object(
    fromPairs(PROPS.map((prop) => [prop, z.array(CondicionSchema).nullable()])),
  )
  .partial();

const modelQuerySchema = model.withStructuredOutput(QuerySchema, {
  strict: false,
});

const promptQuerySchema = `
busco una casa en venta con 2 baños, mas de 2 dormitorios y entre 100mil y 300mil euros
`;

const responseQuerySchema = await modelQuerySchema.invoke(promptQuerySchema);

console.log("responseQuerySchema: ", responseQuerySchema);
console.log("type: ", typeof responseQuerySchema);

// export const getProductos = tool(
//   async ({}) => {
//     try {
//       return "Lamentablemente no hay propiedades que cumplan con los requisitos que busca.";
//     } catch (error) {
//       return "Ocurrió un error interno al procesar la búsqueda de propiedades.";
//     }
//   },
//   {
//     name: "Obtener_pisos_en_venta_dos",
//     description: "Obtiene una lista de propiedades disponibles en el sistema",
//     schema: z.object({}),
//   },
// );
