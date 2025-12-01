import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password.trim();
        const adminEmail = 'admin@news.com';
        const adminPass = 'admin123';

        let user = await prisma.user.findUnique({
          where: {
            email
          }
        });

        if (!user) {
          const isAdmin = email === adminEmail && password === adminPass;
          if (isAdmin) {
            user = await prisma.user.create({
              data: {
                email: adminEmail,
                name: '系统管理员',
                role: 'ADMIN'
              }
            });
          } else {
            return null;
          }
        }

        const isAdmin = email === adminEmail && password === adminPass;
        if (!isAdmin) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = (token as any).sub!;
        (session.user as any).role = (token as any).role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/[lang]/login',
    error: '/[lang]/login'
  }
};
