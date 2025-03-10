// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from "next-auth";

interface Funcao {
  nome: string;
  podeCadastrar: boolean;
  podeConsultar: boolean;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string | null; // Adiciona a propriedade ao tipo Session
    user?: {
      id?: string;  // Adicione esta linha
      token?: string;
      role?: string;
      funcoes?: Funcao[]; // Adiciona funções ao usuário na sessão
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;  // Adicione esta linha
    token?: string; // Adiciona a propriedade ao tipo User
    role?: string;
    funcoes?: Funcao[]; // Adiciona funções ao usuário
  }
}
