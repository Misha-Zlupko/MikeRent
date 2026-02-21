import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const path = request.nextUrl.pathname;

  // Створюємо відповідь
  const response = NextResponse.next();

  // Додаємо заголовки для заборони кешування для ВСІХ сторінок
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  // Логіка авторизації для адмінки
  const isAdminRoute = path.startsWith("/admin");
  const isLoginPage = path === "/admin/login";

  if (path === "/admin") {
    if (token) {
      try {
        verify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } catch {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } else {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

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

  if (isLoginPage && token) {
    try {
      verify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } catch {
      // Токен невалідний - залишаємось на логіні
    }
  }

  return response;
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
