import 'dotenv/config'
import express, { type Response, type Request } from "express";
import { supabase } from "./config/database.js";

const app = express();
const PORT = process.env.PORT || 3333;
app.use(express.json());

app.get("/ping",async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('empresas').select('*').limit(1)
    
    if (error) throw error

    res.status(200).json({
      status: 'success',
      message: '🍕 Servidor Online e Banco de Dados Conectado com Sucesso!',
      db_test: data
    })
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: '❌ Servidor Online, mas falhou ao conectar no Supabase.',
      detalhes: err.message
    })
  }
});

// aqui voces vao colocar as outras rotas como /contas /planoContasRoutes e etc
import { authRoutes } from './routes/auth.routes.js';
app.use('/auth', authRoutes);

// o comando pra rodar o servidor é 'npx tsx server.ts' lembrando que voces tem que estar dentro da pasta src se estiverem fora vao ter que colocar o caminho ate o arquivo /src/server.ts

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}/ping`);
});
