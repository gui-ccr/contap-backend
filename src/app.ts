import 'dotenv/config';
import express from "express";
import cors from "cors";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

const corsOptions = {
  // Em produção, APENAS o frontend da Vercel é permitido.
  // Em desenvolvimento (local), qualquer frontend (localhost, postman, etc) é permitido.
  origin: isProduction 
    ? ["https://contaup-techbalance.vercel.app"] 
    : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Habilita o CORS para permitir requisições do Frontend
app.use(cors(corsOptions));

app.use(express.json());

// A raiz agora responde apenas um healthcheck simples
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "ContaUp API Gateway rodando." });
});

app.use(routes);

app.use(errorMiddleware);

export default app;
