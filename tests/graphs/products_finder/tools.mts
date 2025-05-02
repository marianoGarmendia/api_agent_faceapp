import { AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { z } from "zod";
import { buildFilter } from "./helpers.mjs";
import { embeddingModel } from "./models.mjs";
import {
  buildQueryFilterModel,
  buildQuerySchema,
  INMUEBLE_PROPS,
} from "./schemas.mjs";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

dotenv.config();

const INDEX_NAME = "products";
const index = pinecone.Index(INDEX_NAME); // se pueden agrupar por namespaces. De momento solo esta Default .namespace("propiedades"). Cuando haya varios, tambien se tomara el index dinamicamente

const findProducts = async (prompt: string, props: string[]) => {
  // aqui se construyen el schema de consulta y el modelo de filtro a partir de las propiedades, en forma dinamica
  // hoy son las propiedades, pero podria ser cualquier otro tipo de producto
  const querySchema = buildQuerySchema(props);
  const queryFilterModel = buildQueryFilterModel(querySchema);
  const rawQueryFilter = await queryFilterModel.invoke(prompt);

  const filter = buildFilter(rawQueryFilter); // esta funcion ajusta el objeto de filtro para que sea como lo epsera Pinecone
  console.log({ filter });

  // aqui se vectoriza la query del usuario y se consulta a Pinecone agregando el filtro construido
  // asi filtramos primero con la query estructurada (el filtro) y luego con la query vectorizada (busqueda semantica)
  const embeddedPrompt = await embeddingModel.embedQuery(prompt);
  const result = await index.query({
    vector: embeddedPrompt,
    topK: 5,
    includeMetadata: true,
    filter,
  });

  return result.matches;
};

const products = await findProducts(
  "busco una casa en venta con 2 baños, mas de 2 dormitorios y entre 100mil y 300mil euros",
  INMUEBLE_PROPS,
);

console.log("products", products);

export const productsFinder = tool(
  async ({ _state }: any) => {
    console.log("State:", _state);

    const props = INMUEBLE_PROPS; // de momento lo definimos aqui. Este array deberia obtenerse dinamicamente de acuerdo al tipo de producto que se busque

    try {
      const prompt = `busco una casa en venta con 2 baños, mas de 2 dormitorios y entre 100mil y 300mil euros`;
      const products = await findProducts(prompt, props);

      return {
        messages: [new AIMessage(products.join(""))],
      };
    } catch (error) {
      return "Ocurrió un error interno al procesar la búsqueda de propiedades.";
    }
  },
  {
    name: "getProducts",
    description: "Obtiene una lista de productos disponibles en el sistema",
    schema: z.object({}),
  },
);

const stateAnnotation = MessagesAnnotation;
const toolState = Annotation.Root({
  ...stateAnnotation.spec
});

export const toolNode = async (state: typeof toolState.State) => {
  const { messages } = state;
  console.log({messages})
  const lastMessage = messages.at(-1);
  console.log({lastMessage})
  return { messages: [...messages, lastMessage] };
};