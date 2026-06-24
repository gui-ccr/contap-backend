import 'dotenv/config';
import express from "express";
import cors from "cors";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Habilita o CORS para permitir requisições do Frontend
app.use(cors());

app.use(express.json());

import { getDocsHtml } from "./docs.js";

// Rota Raiz - Documentação da API
app.get("/", (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(getDocsHtml());
});

app.use(routes);

app.use(errorMiddleware);

export default app;
