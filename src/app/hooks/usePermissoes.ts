// "use client";
// import { useSession } from "next-auth/react";

// export const usePermissao = (tela?: string) => {
//   const { data: session } = useSession();

//   const role = session?.user?.role;

//   if (!tela) {
//     return { role };
//   }

//   const funcao = session?.user?.funcoes?.find((f) => f.nome === tela);
//   //const podeAcessar = !!funcao;
//   const podeCadastrar = funcao?.podeCadastrar ?? false;
//   const podeConsultar = funcao?.podeConsultar ?? false;
//   const somenteLeitura = podeConsultar && !podeCadastrar;
//   const podeAcessar = podeCadastrar || podeConsultar; // Pode acessar se tiver pelo menos uma permissão

//   return {
//     role,
//     podeAcessar,
//     podeCadastrar,
//     podeConsultar,
//     somenteLeitura,
//   };
// };

// "use client";
// import { useSession } from "next-auth/react";

// export const usePermissao = () => {
//   const { data: session } = useSession();

//   const role = session?.user?.role;
//   const funcoes = session?.user?.funcoes || [];

//   // Transforma as funções em um objeto para acesso rápido
//   const permissoes = funcoes.reduce((acc, funcao) => {
//     acc[funcao.nome] = {
//       podeAcessar: funcao.podeCadastrar || funcao.podeConsultar,
//       podeCadastrar: funcao.podeCadastrar,
//       podeConsultar: funcao.podeConsultar,
//       somenteLeitura: funcao.podeConsultar && !funcao.podeCadastrar,
//     };
//     return acc;
//   }, {} as Record<string, { podeAcessar: boolean; podeCadastrar: boolean; podeConsultar: boolean; somenteLeitura: boolean }>);

//   return { role, permissoes };
// };

"use client";
import { useSession } from "next-auth/react";

interface Permissao {
  podeAcessar: boolean;
  podeCadastrar: boolean;
  podeConsultar: boolean;
  somenteLeitura: boolean;
}

type PermissaoTela = {
  role: string | undefined;
  podeAcessar: boolean;
  podeCadastrar: boolean;
  podeConsultar: boolean;
  somenteLeitura: boolean;
};

type PermissoesCompletas = {
  role: string | undefined;
  permissoes: Record<string, Permissao>;
};

export function usePermissao(tela: string): PermissaoTela;
export function usePermissao(): PermissoesCompletas;
export function usePermissao(tela?: string): PermissaoTela | PermissoesCompletas {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (tela) {
    // Procura a função correspondente à tela
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const funcao = session?.user?.funcoes?.find((f: any) => f.nome === tela);
    const podeCadastrar = funcao?.podeCadastrar ?? false;
    const podeConsultar = funcao?.podeConsultar ?? false;
    const somenteLeitura = podeConsultar && !podeCadastrar;
    const podeAcessar = podeCadastrar || podeConsultar;

    return {
      role,
      podeAcessar,
      podeCadastrar,
      podeConsultar,
      somenteLeitura,
    };
  } else {
    const funcoes = session?.user?.funcoes || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const permissoes: Record<string, Permissao> = funcoes.reduce((acc: any, funcao: any) => {
      acc[funcao.nome] = {
        podeAcessar: funcao.podeCadastrar || funcao.podeConsultar,
        podeCadastrar: funcao.podeCadastrar,
        podeConsultar: funcao.podeConsultar,
        somenteLeitura: funcao.podeConsultar && !funcao.podeCadastrar,
      };
      return acc;
    }, {} as Record<string, { podeAcessar: boolean; podeCadastrar: boolean; podeConsultar: boolean; somenteLeitura: boolean }>);

    return { role, permissoes };
  }
}


// "use client";
// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useUsuarioService } from "../services";
// import { UsuarioFuncao } from "../models/usuarios";

// export const usePermissao = (tela: string) => {
//   const service = useUsuarioService();
//   const { data: session } = useSession();
//   const [usuariosFuncoes, setUsuariosFuncoes] = useState<UsuarioFuncao | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!session?.user?.id || !session.accessToken) {
//       setLoading(false);
//       return;
//     }

//     async function fetchUserPermissions() {
//       try {
//         setLoading(true);
        
//         // Faz a requisição passando o ID do usuário e o nome da tela
//         if (session?.user?.id === null || session?.user?.id === undefined){
//             throw new Error("Usuário não está sendo informado, por favor chamar o suporte");
//         }
//         const res = await service.userAuthFuncoes(session?.user?.id, tela);

//         if (!res) {
//           throw new Error("Erro ao buscar permissões");
//         }

//         const data = await res;

//         // Como a query já retorna apenas um objeto, basta setá-lo diretamente
//         setUsuariosFuncoes(data);
//       } catch (err) {
//         setError("Erro ao buscar permissões");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUserPermissions();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [session, tela]);

//   const podeAcessar = !!usuariosFuncoes?.funcao;
//   const podeCadastrar = usuariosFuncoes?.podeCadastrar ?? false;
//   const podeConsultar = usuariosFuncoes?.podeConsultar ?? false;
//   const somenteLeitura = podeConsultar && !podeCadastrar;

//   return {
//     podeAcessar,
//     podeCadastrar,
//     podeConsultar,
//     somenteLeitura,
//     loading,
//     error,
//   };
// };