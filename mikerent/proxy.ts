import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const path = request.nextUrl.pathname;

  // Якщо це головна адмінки (/admin)
  if (path === "/admin") {
    if (token) {
      try {
        verify(token, JWT_SECRET);
        // Якщо токен валідний - редірект на дашборд
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } catch {
        // Якщо токен невалідний - редірект на логін
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } else {
      // Якщо немає токена - редірект на логін
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Захист інших адмін роутів (крім логіну)
  const isAdminRoute = path.startsWith("/admin");
  const isLoginPage = path === "/admin/login";

  if (isAdminRoute && !isLoginPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      verify(token, JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Якщо користувач вже залогінений і намагається зайти на логін
  if (isLoginPage && token) {
    try {
      verify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } catch {
      // Токен невалідний - залишаємось на логіні
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
