import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function middleware(req: NextRequest) {

  // Obtém o token como objeto
  const tokenObj = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!tokenObj) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Extrai o accessToken e garante que é uma string
  const accessToken = tokenObj.accessToken as string | undefined;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decodedToken = jwt.decode(accessToken) as JwtPayload | null;

  if (!decodedToken || typeof decodedToken.exp !== "number") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (Date.now() / 1000 > decodedToken.exp) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashVendas/:path*", "/consultas/:path*", "/cadastros/:path*", "/", "/relatorios/:path*"],
};
