import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, 
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 3000000, // 50 minutes
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter email" },
        password: { label: "Password", type: "password" },
        token: { label: "ID Token", type: "text" },
        userId: { label: "User ID", type: "text" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
        role: { label: "Role", type: "text" },
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        console.log("NextAuth authorize called with credentials:", {
          email: credentials?.email,
          hasToken: !!credentials?.token,
          hasUserId: !!credentials?.userId,
          role: credentials?.role
        });

        if (!credentials?.email || !credentials?.token || !credentials?.userId) {
          console.error("Missing required credentials: email, token, or userId");
          return null;
        }

        try {
          console.log("Creating user session with provided data");
          
          const user = {
            id: credentials.userId,
            email: credentials.email,
            name: `${credentials.firstName} ${credentials.lastName}`,
            role: credentials.role,
            displayName: `${credentials.firstName} ${credentials.lastName}`,
            token: credentials.token,
          };

          console.log("Returning user object:", user);
          return user;
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.displayName = user.displayName;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.displayName = token.displayName;
        session.token = token.token;
      }
      console.log('Final session data:', session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };