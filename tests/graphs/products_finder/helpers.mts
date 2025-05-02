import z from "zod";
import { ConditionSchema } from "./schemas.mjs";
import { fromPairs, toPairs } from "lodash-es";

/**
 * Genera un filtro de consulta en el formato esperado por Pinecone a partir de un objeto de consulta.
 * @param rawQuery - Objeto de consulta que contiene las propiedades y condiciones de la consulta.
 * @returns
 */
export const buildFilter = <T extends Record<string, any>>(rawQuery: T) => {
  const queryPairs = toPairs(rawQuery) // Convertir el objeto a un array de pares clave-valor
    .filter(([key, value]) => value !== null)
    .map(([key, conditions]) => {
      const value = fromPairs(
        // Convertir el array de condiciones a un objeto
        (conditions as z.infer<typeof ConditionSchema>[]).map(
          ({ operator, value }) => [operator, value],
        ),
      );
      return [key, value];
    });

  return fromPairs(queryPairs); // Convertir el array de pares clave-valor de nuevo a un objeto
};
