import { createYoga } from 'graphql-yoga';
import { lucia } from '../lib/auth';
import { db } from '../lib/db';
import { schema } from '../lib/graphql/schema';
import { sessions } from '../lib/schema/auth';
import { eq } from 'drizzle-orm';

// Create the GraphQL Yoga server
export const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    // Get cookies object for easier manipulation
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieObj = Object.fromEntries(
      cookieHeader.split('; ').filter(Boolean).map(cookie => {
        const [name, ...value] = cookie.split('=');
        return [name, value.join('=')];
      })
    );

    // Get session ID from cookies
    const sessionId = cookieObj[lucia.sessionCookieName];

    // Initialize context variables
    let user = null;
    let session = null;

    if (sessionId) {
      try {
        // Validate the session
        const result = await lucia.validateSession(sessionId);

        if (result.session) {
          // If session exists, set the session data
          session = result.session;

          // If user exists, set the user data
          if (result.user) {
            user = result.user;

            // Get additional session data from our database
            const dbSession = await db.query.sessions.findFirst({
              where: { id: session.id }
            });

            if (dbSession?.activeOrganizationId) {
              // Add activeOrganizationId to user object
              user = {
                ...user,
                activeOrganizationId: dbSession.activeOrganizationId
              };
            }
          }

          // Handle session renewal
          if (result.session.fresh) {
            const { name, value, attributes } = lucia.createSessionCookie(result.session.id);
            // Set the new session cookie
            request.headers.append('Set-Cookie', `${name}=${value}; ${Object.entries(attributes)
              .map(([key, value]) => `${key}=${value}`)
              .join('; ')}`);
          }
        }
      } catch (error) {
        // If session validation fails, we'll have null user and session
        console.error('Session validation error:', error);
      }
    }

    // Return the context object
    return {
      db,
      user,
      session,
      req: {
        cookies: {
          get: (name: string) => ({ value: cookieObj[name] }),
          set: (name: string, value: string, attributes: Record<string, string>) => {
            const cookie = `${name}=${value}; ${Object.entries(attributes)
              .map(([key, value]) => `${key}=${value}`)
              .join('; ')}`;
            request.headers.append('Set-Cookie', cookie);
          }
        }
      }
    };
  },
});
