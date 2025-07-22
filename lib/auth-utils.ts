import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export class AuthUtils {
  static async getAuthUser(): Promise<AuthUser | null> {
    const session = await auth();
    if (session?.user && session.user.id) {
      return {
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null
      };
    }
    return null;
  }

  static async getAuthUserId(): Promise<string | null> {
    const session = await auth();
    return session?.user?.id || null;
  }
}

export function withAuth(handler: (req: Request, user: AuthUser) => Promise<NextResponse>) {
  return async function (request: Request) {
    const userIdFromHeader = request.headers.get('x-user-id');
    let user = await AuthUtils.getAuthUser();

    if (!user && userIdFromHeader) {
      user = {
        id: userIdFromHeader,
        email: null,
        name: null
      };
    }

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (userIdFromHeader && user.id !== userIdFromHeader) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    return handler(request, user);
  };
}
