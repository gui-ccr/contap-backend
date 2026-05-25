import { type Request, type Response } from 'express';
import { supabase } from '../config/database.js';

// Função para registrar usuário e empresa
export const registrar = async (req: Request, res: Response) => {
  try {
    const { email, senha, nome_usuario, nome_fantasia, razao_social, cnpj } = req.body;

    if (!email || !senha || !nome_usuario || !nome_fantasia || !razao_social || !cnpj) {
      return res.status(400).json({ error: 'Campos de cadastro incompletos.' });
    }

    // 1. Cria a empresa
    const { data: empresa, error: erroEmpresa } = await supabase
      .from('empresas')
      .insert([{ nome_fantasia, razao_social, cnpj }])
      .select().single();

    if (erroEmpresa) throw erroEmpresa;

    // 2. Cria o usuário vinculado
    const { data: usuario, error: erroUsuario } = await supabase
      .from('usuarios')
      .insert([{ email, senha, nome: nome_usuario, empresa_id: empresa.id }])
      .select().single();

    if (erroUsuario) throw erroUsuario;

    return res.status(201).json({ message: "Cadastro realizado!", empresa, usuario });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};