import z from "zod";
import { ConditionSchema } from "./schemas.mjs";
import { fromPairs, toPairs } from "lodash-es";

export const buildFilter = <T extends Record<string, any>>(rawQuery: T) => {
  const queryPairs = toPairs(rawQuery)
    .filter(([key, value]) => value !== null)
    .map(([key, conditions]) => {
      const value = fromPairs(
        (conditions as z.infer<typeof ConditionSchema>[]).map(
          ({ operator, value }) => [operator, value],
        ),
      );
      return [key, value];
    });

  return fromPairs(queryPairs);
};
