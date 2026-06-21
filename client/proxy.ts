import { NextRequest, NextResponse } from 'next/server';

const authRoutes = ['/sign-in'];
const adminRoutes = ['/admin'];
const studentRoutes = ['/learn'];
const protectedRoutes = ['/learn', '/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => {
    pathname.startsWith(route);
  });
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isStudentRoute = studentRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/learn', request.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isAdminRoute && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/learn', request.url));
  }
  
  if (isStudentRoute && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
