import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" },
      },
      //
      //http://localhost:8080/auth/login
      async authorize(credentials) {
        console.log("Enviando login para API...");
        const res = await fetch("https://backendgutosystem.eadescola.online/auth/login", {
        // const res = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });
        console.log("Resposta do servidor:", res.status);
        const user = await res.json();

        if (!res.ok) {
          throw new Error(user.message || "Falha na autenticação");
        }

        return { 
          token: String(user.token), // Garante que token seja string
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          funcoes: user.funcoes ?? [], // Garante que seja sempre um array
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.funcoes = user.funcoes;

        // Decodifica e tipa corretamente o token
        const decoded = jwt.decode(user.token || '') as JwtPayload | null;
        token.exp = decoded?.exp ?? null;
      }
    
      // Garantindo que token.exp é sempre um número ou null
      if (typeof token.exp === "number" && Date.now() / 1000 > token.exp) {
        return {};
      }
    
      return token;
    },
    async session({ session, token }) { 
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : null;
      session.user = {
        id: String(token.id), // Força a tipagem correta
        name: token.name,
        email: token.email,
        role: String(token.role),
        funcoes: Array.isArray(token.funcoes) ? token.funcoes : [], // Garante que funcoes seja sempre um array
      };
      return session;
    }
    
  },
};

// Exporta as rotas GET e POST para o App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
