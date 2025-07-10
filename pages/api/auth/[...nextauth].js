import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Attempting to connect to DB for authorization...');
        await dbConnect();
        console.log('DB connection attempted.');

        const user = await User.findOne({ username: credentials.username });
        console.log('User found:', user ? user.username : 'None');

        if (!user) {
          console.log('User not found.');
          return null;
        }
        console.log(`User ${user.username} isActive: ${user.isActive}`);
        if (!user.isActive) {
          console.log('User is inactive.');
          throw new Error('/login?message=inactive');
        }
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
          console.log('Password does not match.');
          return null;
        }
        console.log('User authorized.');
        return { id: user._id.toString(), name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (token.sub) {
        token.id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
