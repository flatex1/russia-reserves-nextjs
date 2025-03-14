import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const listReserves = query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new ConvexError("Ограничено в доступе");
      }

      const reserves = await ctx.db.query("reserves").collect();
      return Promise.all(
        reserves.map(async (reserve) => {
          const imageUrl = reserve.imageUrl ? await ctx.storage.getUrl(reserve.imageUrl) : undefined;
          if (!imageUrl) {
            throw new ConvexError("Файл не найден");
          }
          return {
            ...reserve,
            imageUrl,
          };
        }),
      );
    },
    args: {},
  });

export const createReserve = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    region: v.string(),
    yearFounded: v.number(),
    flora: v.array(v.string()),
    fauna: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    additionalImages: v.optional(v.array(v.string())),
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        address: v.string(),
        directions: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const reserveId = await ctx.db.insert("reserves", {
      ...args,
    });

    return reserveId;
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const uploadReserveImage = mutation({
  args: {
    reserveId: v.id("reserves"),
    fileId: v.id("_storage"),
  },
  async handler(ctx, args) {
    const reserve = await ctx.db.get(args.reserveId);
    if (!reserve) {
      throw new ConvexError("Заповедник не найден");
    }

    const fileUrl = await ctx.storage.getUrl(args.fileId);
    if (!fileUrl) {
      throw new ConvexError("Файл не найден");
    }

    await ctx.db.patch(args.reserveId, {
      imageUrl: args.fileId,
    });

    return args.fileId;
  },
});

export const getReserveImages = query({
  args: {
    reserveId: v.id("reserves"),
  },
  async handler(ctx, args) {
    const reserve = await ctx.db.get(args.reserveId);
    if (!reserve) {
      throw new ConvexError("Заповедник не найден");
    }

    const imageUrl = reserve.imageUrl ? await ctx.storage.getUrl(reserve.imageUrl) : undefined;
    if (!imageUrl) {
      throw new ConvexError("Изображение не найдено");
    }

    return imageUrl;
  },
});

export const getReserve = query({
  args: {
    reserveId: v.id("reserves"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Ограничено в доступе");
    }
    
    const reserve = await ctx.db.get(args.reserveId);
    if (!reserve) {
      throw new ConvexError("Заповедник не найден");
    }

    const imageUrl = reserve.imageUrl ? await ctx.storage.getUrl(reserve.imageUrl) : undefined;
    const additionalImages = reserve.additionalImages ? await Promise.all(reserve.additionalImages.map(async (id) => await ctx.storage.getUrl(id))) : [];

    return {
      ...reserve,
      imageUrl,
      additionalImages,
    };
  },
});

export const getUniqueRegions = query({
  handler: async (ctx) => {
    const reserves = await ctx.db.query("reserves").collect();
    const uniqueRegions = Array.from(new Set(reserves.map(reserve => reserve.region)));
    return uniqueRegions;
  },
});

export const getReserveReviews = query({
  args: {
    reserveId: v.id("reserves"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Ограничено в доступе");
    }

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_reserve", (q) => q.eq("reserveId", args.reserveId))
      .order("desc")
      .collect();

    return reviews;
  },
});

export const createReview = mutation({
  args: {
    reserveId: v.id("reserves"),
    rating: v.number(),
    text: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Необходимо авторизоваться для создания отзыва");
    }

    const userId = identity.subject;
    const userName = identity.name || "Пользователь";

    const reviewId = await ctx.db.insert("reviews", {
      reserveId: args.reserveId,
      userId: userId,
      userName: userName,
      rating: args.rating,
      text: args.text,
      date: Date.now(),
    });

    return reviewId;
  },
});