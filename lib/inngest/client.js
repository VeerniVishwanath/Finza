import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "finza",
  name: "FiNZA",
  retryFunction: async (attempt) => ({
    delay: 2 ** attempt * 1000, // Exponential backoff
    maxAttempts: 2,
  }),
});
