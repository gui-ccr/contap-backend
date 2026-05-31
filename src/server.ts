import 'dotenv/config'
import express from "express";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());
app.use(routes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});