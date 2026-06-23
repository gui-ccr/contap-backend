import 'dotenv/config';
import express from "express";
import cors from "cors";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Habilita o CORS para permitir requisições do Frontend
app.use(cors());

app.use(express.json());
app.use(routes);

app.use(errorMiddleware);

export default app;
