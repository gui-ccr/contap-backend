import { describe, it, expect, test } from "vitest";
import { type ICriarUsuario, Cargos } from "../src/schemas/Usuarios";

function criarUsuario(
  id: string,
  nome: string,
  empresa_id: string,
  email: string,
  cargo: Cargos,
): ICriarUsuario {
  return { id, nome, empresa_id, email, cargo };
}


// describe é basicamente um agrupamento de testes que vc vai fazer
describe("Ambiente de Testes da Pizzaria", () => {
// test é o teste em si que voce ta fazendo, primeiro voce passa a descrição do teste e depois chama a função callback e passa a logica do teste
  test("Deve garantir que o ViteTest esta rodando certo", () => {
    // nesse caso um teste de soma simples
    const resultado = 2 + 2;
    // expect é o oque voce QUER que de ou seja vc espera que o resultado .toBe (ser) 4  
    expect(resultado).toBe(4);
  });
  // it é a mesma coisa do test tanto faz qual vc usa, é so convenção de nomenclaura, it siginifca To be ou deveria ser sla tanto faz
  it("Deve garantir que 10 - 5 é igual a 5", () => {
    const lucro = 10 - 5;
    expect(lucro).toBe(5);
  });

  test("Criar um usuario com os campos corretos", () => {
    const usuario = criarUsuario(
      crypto.randomUUID(),
      "Guilherme",
      crypto.randomUUID(),
      "guilhermerodrigues6484@gmail.com",
      Cargos.DONO,
    );

    expect(usuario).toEqual(
      expect.objectContaining({
        nome: "Guilherme",
        email: "guilhermerodrigues6484@gmail.com",
      }),
    );
    expect(usuario.id).toBeDefined()
  });
});


// para executar o teste vc digita 'npm test', e se vc quiser ir para o site e ter um detalhamento visual dos testes e so digitar 'npm run test:ui'