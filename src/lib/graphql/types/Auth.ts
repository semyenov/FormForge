import { builder } from '../builder';
import { tables } from '../../schema';
import { UserType } from './User';
import { lucia } from '../../auth';
import bcrypt from 'bcryptjs';

// Login input type
export const LoginInputType
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
        input: t.arg({ type: LoginInputType, required: true }),
      },
      resolve: async (_, { input }, context) => {
        // Find the user by email
        const user = await context.db.query.users.findFirst({
          where: { email: input.email },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Find the user's account with password
        const account = await context.db.query.accounts.findFirst({
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
        const session = await lucia.createSession(user.id, {
          // Store active organization if user has one
          token: crypto.randomUUID(),
          activeOrganizationId: context.session?.activeOrganizationId || undefined
        });

        // Set the session cookie
        const { name, value, attributes } = lucia.createSessionCookie(session.id);
        context.req.cookies.set(name, value, attributes);

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
          where: { email: input.email },
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

        // Hash the password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Create account with hashed password
        await context.db.insert(tables.accounts).values({
          id: crypto.randomUUID(),
          userId: userId,
          providerId: 'credentials',
          accountId: input.email,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Create a session
        const session = await lucia.createSession(userId, {});

        // Set the session cookie
        const { name, value, attributes } = lucia.createSessionCookie(session.id);
        context.req.cookies.set(name, value, attributes);

        // Return the created user
        const newUser = await context.db.query.users.findFirst({
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
    resolve: async (_, __, context) => {
      // Get the session cookie
      const sessionId = context.req.cookies.get(lucia.sessionCookieName)?.value;

      if (sessionId) {
        // Invalidate the session
        await lucia.invalidateSession(sessionId);

        // Remove the cookie
        const { name, value, attributes } = lucia.createBlankSessionCookie();
        context.req.cookies.set(name, value, attributes);
      }

      return true;
    },
  })
);
