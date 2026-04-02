import express, { type Express } from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

declare module "express-serve-static-core" {
  interface Request {
    session?: {
      participantId?: number;
      isAdmin?: boolean;
    } | null;
  }
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(
  cookieSession({
    name: "workshop-session",
    secret: process.env.SESSION_SECRET || "workshop-secret-key-2026",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: false,
    httpOnly: true,
    sameSite: "lax",
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api", router);

export default app;
