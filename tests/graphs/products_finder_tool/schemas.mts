import { fromPairs } from "lodash-es";
import z from "zod";

export const INMUEBLE_PROPS = [
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

export const ConditionSchema = z.object({
  operator: z.enum(OPERATORS),
  value: z.number().nullable(),
});

export const buildQuerySchema = (props: string[]) =>
  z
    .object(
      fromPairs(
        props.map((prop) => [prop, z.array(ConditionSchema).nullable()]),
      ),
    )
    .partial();
