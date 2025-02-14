import arcjet, { tokenBucket } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 20, // 20 requests per hour
      interval: 3600, // Every 1 hour
      capacity: 20, // Can hold up to 20 requests
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 1, // Extra protection for bursts
      interval: 60, // 1 request every 12 seconds
      capacity: 1, // Max 5 requests per minute
    }),
  ],
});
