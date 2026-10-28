import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { serve } from "inngest/express";
import "../instrument.mjs";
import { ENV } from "./config/env.js";
import { functions, inngest } from "./config/inngest.js";
import { connectDB } from "./DB/db.js";
import chatRoutes from "./routes/chat.route.js";

import * as Sentry from "@sentry/node";

const app = express();

app.use(express.json());
const normalizeOrigin = (origin) => origin?.replace(/\/+$/, "") || "";
const allowedOrigins = (ENV.CLIENT_URL || "")
  .split(",")
  .map((url) => normalizeOrigin(url.trim()))
  .filter(Boolean);
console.log("CORS allowed origins:", allowedOrigins.length ? allowedOrigins : ["<any origin when CLIENT_URL not set>"]);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "OPTIONS"],
}));
app.use(clerkMiddleware());

app.get("/debug-sentry", (req, res) => {
  res.send("Hello error");
});

app.get("/", (req, res) => {
  res.send("backend is working!");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

Sentry.setupExpressErrorHandler(app);

const startServer = async () => {
  try {
    await connectDB();
    const isVercel = Boolean(process.env.VERCEL);
    console.log("Server environment:", {
      nodeEnv: ENV.NODE_ENV,
      port: ENV.PORT,
      isVercel,
      clientUrl: ENV.CLIENT_URL,
    });

    if (!isVercel && ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => {
        console.log(`Server is running on port ${ENV.PORT}`);
      });
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
