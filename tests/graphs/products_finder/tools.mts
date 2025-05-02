import { tool } from "@langchain/core/tools";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { z } from "zod";
import { buildFilter } from "./helpers.mjs";
import { embeddingModel } from "./models.mjs";
import {
  buildQueryFilterModel,
  buildQuerySchema
} from "./schemas.mjs";
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

dotenv.config();

const INDEX_NAME = "products";
const index = pinecone.Index(INDEX_NAME);

const findProducts = async (prompt: string, props: string[]) => {
  const querySchema = buildQuerySchema(props);
  const queryFilterModel = buildQueryFilterModel(querySchema);
 
  console.log("queryFilterModel", queryFilterModel);
  const rawQueryFilter = await queryFilterModel.invoke(prompt);
  // esto esta llegando como mensaje de "ai" y se renderiza en el front, tengo que no renderizarlo o ver la manera de que no se ejecute aqui
  
  

 


  const filter = buildFilter(rawQueryFilter); // esta funcion ajusta el objeto de filtro para que sea como lo epsera Pinecone
  console.log("filter", filter);
  
  // console.log({ filter });

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

export const productsFinder = tool(
  async ({ prompt, props }) => {
  
    try {
      
      const products = await findProducts(prompt, props);
      let property = {} as any

      products.forEach((product, index) => {
        property[index] = {
          ...product.metadata || "",
          id: product.metadata || "",
        }
      })

      // llamada a la API de winwin para obtener los datos de la propiedad completa
      const responseString = JSON.stringify(property, null, 2)
      

      return responseString;
    } catch (error) {
      return "Ocurrió un error interno al procesar la búsqueda de propiedades.";
    }
  },
  {
    name: "products_finder",
    description: "Obtiene una lista de productos disponibles en el sistema",
    schema: z.object({
      prompt: z.string().describe("Consulta del usuario sobre el producto buscado"),
      props: z.array(z.string()).describe("Atributos del producto que se pueden filtrar"),
    }),
  },
);
