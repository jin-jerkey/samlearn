import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Si la requête concerne un fichier dans /uploads
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    // Rediriger vers le dossier réel dans src/app/uploads
    const url = request.nextUrl.clone();
    url.pathname = `/src/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}