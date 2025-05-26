import Axios, { AxiosError, AxiosInstance } from "axios";
import { getSession, signOut } from "next-auth/react";
import { jwtDecode } from "jwt-decode"; // ✅ Corrigido
import { JwtPayload } from "jsonwebtoken"; // Mantém apenas o tipo
import Router from "next/router";
// https://backendgutosystem.eadescola.online:8080/auth/login
export const httpClient: AxiosInstance = Axios.create({
  baseURL: "https://backendgutosystem.eadescola.online/",
  withCredentials: true,
});

// export const httpClient: AxiosInstance = Axios.create({
//   baseURL: "http://localhost:8080/",
//   withCredentials: true,
// });

// 🔥 Interceptor para adicionar o token automaticamente em todas as requisições
httpClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession(); // Pega a sessão do NextAuth
      const token = session?.accessToken;

      if (token) {
        const decodedToken = jwtDecode<JwtPayload>(token); // ✅ Agora funciona!

        if (decodedToken.exp && Date.now() / 1000 > decodedToken.exp) {
          await signOut(); // Desloga o usuário
          Router.push("/login"); // Redireciona para login
          return Promise.reject(new Error("Token expirado"));
        }

        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 📌 Interceptor para capturar erros da resposta
httpClient.interceptors.response.use(
  (response) => {
    return response; // Apenas retorna a resposta se for bem-sucedida
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        signOut(); // Desloga o usuário
        Router.push("/login"); // Redireciona para login
      }

      return Promise.reject(error.response.data || { message: "Erro desconhecido na API" });
    }

    return Promise.reject({ message: "Erro desconhecido na requisição, entre em contato com o suporte" });
  }
);
