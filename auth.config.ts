import { NextAuthConfig, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';

declare module 'next-auth' {
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    role: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: string;
    accessToken: string;
  }
}

interface IUser {
  _id: string;
  email: string;
  role: string;
  firstName: string;
}

interface UserResponse {
  message: string;
  status_code: number;
  data: IUser;
  error: null;
  accessToken: string;
}

const authConfig = {
  providers: [
    CredentialProvider({
      name: 'credentials',
      credentials: {
        email: {
          type: 'email'
        },
        password: {
          type: 'password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            return null;
          }
          const userData = (await response.json()) as UserResponse;
          if (userData?.accessToken) {
            cookies().set('accessToken', userData.accessToken, {});
          }

          return {
            id: userData.data._id,
            name: userData.data.firstName,
            email: userData.data.email,
            role: userData.data.role,
            accessToken: userData.accessToken
          } as User;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    jwt({ token, user, trigger }: { token: JWT; user: any; trigger?: 'signIn' | 'signUp' | 'update' }) {
      if (user && trigger === 'signIn') {
        const standardUser = user as User;
        token.id = standardUser.id!;
        token.role = standardUser.role;
        token.name = standardUser.name!;
        token.email = standardUser.email!;
        token.accessToken = standardUser.accessToken;
        apiClient.defaults.headers.Authorization = `Bearer ${token.accessToken}`;
      }
      return token;
    },
    session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token.accessToken}`;
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.accessToken = token.accessToken;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;

export default authConfig;
