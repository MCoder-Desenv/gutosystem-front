import NextAuth from "next-auth";
import { authOptions } from "../../../../auth"; // Certifique-se de que este caminho está correto

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
