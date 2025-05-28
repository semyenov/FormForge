import { lucia } from '../../auth';
import { tables } from '../../schema';
import { builder } from '../builder';
import { UserType } from './User';

// Login input type
export const LoginInput
  = builder.inputType('LoginInput', {
    fields: (t) => ({
      email: t.string({ required: true, validate: { email: true } }),
      password: t.string({ required: true, validate: { minLength: 8 } }),
    }),
  });

// Register input type
export const RegisterInput
  = builder.inputType('RegisterInput', {
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
        input: t.arg({ type: LoginInput, required: true }),
      },
      resolve: async (_, { input }, context) => {
        // Find the user by email
        const user = await context.db.query.users.findFirst({
          where: { email: input.email, },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Find the user's account with password
        const account = await context.db.query.accounts.findFirst({
          where: { userId: user.id, providerId: 'credentials' },
        });

        if (!account || !account.password) {
          throw new Error('Invalid email or password');
        }

        // Validate password (in a real app, use a proper password validation)
        // This is just a placeholder - in a real app, use bcrypt or Argon2
        if (account.password !== input.password) {
          throw new Error('Invalid email or password');
        }

        // Create a new session
        const sessionId = crypto.randomUUID();
        const session = await lucia.createSession(user.id, {
          createdAt: new Date(),
          updatedAt: new Date(),
          id: sessionId,
          token: crypto.randomUUID(),
          userId: user.id,
          userAgent: null,
          ipAddress: null,
          activeOrganizationId: null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          impersonatedBy: null,
        }, {
          sessionId
        });

        const { name, value, attributes } = lucia.createSessionCookie(session.id);
        context.cookies.set({
          name,
          value,
          domain: attributes.domain || null,
          expires: attributes.expires || null,
          secure: attributes.secure || false,
          sameSite: attributes.sameSite || 'lax',
          httpOnly: attributes.httpOnly || true,
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
      resolve: async (_, { input }, context) => {
        // Check if user already exists
        const existingUser = await context.db.query.users.findFirst({
          where: { email: input.email, }
        });

        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        const userId = crypto.randomUUID();

        // Create the new user
        await context.db.insert(tables.users).values({
          id: userId,
          name: input.name,
          email: input.email,
          emailVerified: false,
          role: 'user',
          updatedAt: new Date(),
        });

        // Create account with password (in a real app, hash the password)
        await context.db
          .insert(tables.accounts)
          .values({
            id: crypto.randomUUID(),
            userId: userId,
            providerId: 'credentials',
            accountId: input.email,
            password: input.password, // This should be hashed in a real app
            createdAt: new Date(),
            updatedAt: new Date(),
          });

        // Create a session
        const sessionId = crypto.randomUUID();
        const session = await lucia.createSession(userId, {
          createdAt: new Date(),
          updatedAt: new Date(),
          id: sessionId,
          token: crypto.randomUUID(),
          userId: userId,
          userAgent: null,
          ipAddress: null,
          activeOrganizationId: null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          impersonatedBy: null,
        }, {
          sessionId
        });

        const { name, value, attributes } = lucia.createSessionCookie(session.id);
        context.cookies.set({
          name,
          value,
          domain: attributes.domain || null,
          expires: attributes.expires || null,
          secure: attributes.secure || false,
          sameSite: attributes.sameSite || 'lax',
          httpOnly: attributes.httpOnly || true,
        });

        // Return the created user
        const newUser = await context.db.query.users.findFirst({
          where: { id: userId, },
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
    resolve: async (_, __, context) => {
      // Invalidate the session
      const sessionId = await context.cookies.get(lucia.sessionCookieName);

      if (sessionId) {
        await lucia.invalidateSession(sessionId.value);
        context.cookies.delete(lucia.sessionCookieName);
      }

      return true;
    },
  })
);
