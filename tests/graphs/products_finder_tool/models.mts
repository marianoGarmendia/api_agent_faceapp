import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
import { ZodSchema } from "zod";
dotenv.config();

const EMBEDDING_MODEL = "text-embedding-3-small";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const embeddingModel = new OpenAIEmbeddings({
  openAIApiKey: OPENAI_API_KEY,
  model: EMBEDDING_MODEL,
  batchSize: 100,
  dimensions: 512,
});

const chatModel = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: OPENAI_API_KEY,
  temperature: 0,
});

export const buildQueryFilterModel = (querySchema: ZodSchema) =>
  chatModel.withStructuredOutput(querySchema, {
    strict: false,
  });
