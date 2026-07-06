import app from "./app.js";

const PORT = process.env.PORT || 3333;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
// trigger restart
