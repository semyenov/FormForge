import { builder } from '../builder';
import { tables } from '../../schema';
import { UserType } from './User';
import { lucia } from '../../auth';
import bcrypt from 'bcryptjs';

// Login input type
export const LoginInputType = builder.inputType('LoginInput', {
  fields: (t) => ({
    email: t.string({ required: true, validate: { email: true } }),
    password: t.string({ required: true, validate: { minLength: 8 } }),
  }),
});

// Register input type
export const RegisterInput = builder.inputType('RegisterInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    email: t.string({ required: true, validate: { email: true } }),
    password: t.string({ required: true, validate: { minLength: 8 } }),
  }),
});

// Login mutation
builder.mutationField(
  'login',
  (t) =>
    t.field({
      type: UserType,
      args: {
        input: t.arg({ type: LoginInputType, required: true }),
      },
      resolve: async (_, { input }, { db, cookies, session }) => {
        // Find the user by email
        const user = await db.query.users.findFirst({
          where: { email: input.email },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Find the user's account with password
        const account = await db.query.accounts.findFirst({
          where: { userId: user.id },
        });

        if (!account || !account.password) {
          throw new Error('Invalid email or password');
        }

        // Validate password with bcrypt
        const validPassword = await bcrypt.compare(input.password, account.password);
        if (!validPassword) {
          throw new Error('Invalid email or password');
        }

        // Create a new session
        const newSession = await lucia.createSession(user.id, {
          id: crypto.randomUUID(),
          token: crypto.randomUUID(),
          activeOrganizationId: session?.activeOrganizationId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          impersonatedBy: null,
          ipAddress: null,
          userAgent: null,
        });

        // Set the session cookie
        const cookie = lucia.createSessionCookie(newSession.id);

        cookies.set({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.attributes.domain || null,
          expires: cookie.attributes.expires || null,
          secure: cookie.attributes.secure || false,
          sameSite: cookie.attributes.sameSite || 'lax',
          httpOnly: cookie.attributes.httpOnly || true,
        });

        return user;
      },
    })
);

// Register mutation
builder.mutationField(
  'register',
  (t) =>
    t.field({
      type: UserType,
      args: {
        input: t.arg({ type: RegisterInput, required: true }),
      },
      resolve: async (_, { input }, { db, cookies, session }) => {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        const userId = crypto.randomUUID();

        // Create the new user
        await db.insert(tables.users).values({
          id: userId,
          name: input.name,
          email: input.email,
          emailVerified: false,
          role: 'user',
          updatedAt: new Date(),
        });

        // Hash the password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Create account with hashed password
        await db.insert(tables.accounts).values({
          id: crypto.randomUUID(),
          userId: userId,
          providerId: 'credentials',
          accountId: input.email,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create a session
        const newSession = await lucia.createSession(userId, {
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId,
          activeOrganizationId: session?.activeOrganizationId || null,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          token: crypto.randomUUID(),
          impersonatedBy: null,
          ipAddress: null,
          userAgent: null,
        });

        // Set the session cookie
        const { name, value, attributes } = lucia.createSessionCookie(newSession.id);

        cookies.set({
          name,
          value,
          domain: attributes.domain || null,
          expires: attributes.expires || null,
          secure: attributes.secure || false,
          sameSite: attributes.sameSite || 'lax',
          httpOnly: attributes.httpOnly || true,
        });

        // Return the created user
        const newUser = await db.query.users.findFirst({
          where: { id: userId },
        });

        if (!newUser) {
          throw new Error('Failed to create user');
        }

        return newUser;
      },
    })
);

// Logout mutation
builder.mutationField('logout', (t) =>
  t.boolean({
    authScopes: {
      loggedIn: true,
    },
    resolve: async (_, __, { cookies }) => {
      // Get the session cookie
      const sessionId = await cookies.get(lucia.sessionCookieName);

      if (sessionId) {
        // Invalidate the session
        await lucia.invalidateSession(sessionId.value);

        // Remove the cookie
        const { name, value, attributes } = lucia.createBlankSessionCookie();

        cookies.set({
          name,
          value,
          domain: attributes.domain || null,
          expires: attributes.expires || null,
          secure: attributes.secure || false,
          sameSite: attributes.sameSite || 'lax',
          httpOnly: attributes.httpOnly || true,
        });
      }

      return true;
    },
  })
);
