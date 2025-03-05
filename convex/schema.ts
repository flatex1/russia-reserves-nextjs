import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  reserves: defineTable({
    name: v.string(),
    description: v.string(),
    region: v.string(),
    yearFounded: v.number(),
    flora: v.array(v.string()),
    fauna: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    additionalImages: v.optional(v.array(v.string())),
  }).index("by_region", ["region"]),
});
