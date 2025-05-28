import { lucia } from '../lib/auth';
import { db } from '../lib/db';
import { schema } from '../lib/graphql/schema';
import { createServer } from 'http';
import { createYoga, createPubSub } from 'graphql-yoga';
import { useCookies } from '@whatwg-node/server-plugin-cookies';

const pubsub = createPubSub();
const cookies = useCookies();

const yoga = createYoga({
  schema,
  plugins: [cookies],
  context: async ({ request }) => {
    if (!request.cookieStore) {
      return {
        db,
        pubsub,
        user: null,
        session: null,
        cookies: null,
      };
    }

    const sessionId = await request.cookieStore.get(lucia.sessionCookieName);

    if (sessionId) {
      try {
        // Validate the session
        const { session, user } = await lucia.validateSession(
          sessionId.value
        );

        // Handle session renewal
        if (session?.fresh) {
          const { name, value, attributes } = lucia.createSessionCookie(session.id);
          request.cookieStore?.set({
            name,
            value,
            domain: attributes.domain || null,
            expires: attributes.expires || null,
            secure: attributes.secure || false,
            sameSite: attributes.sameSite || 'lax',
            httpOnly: attributes.httpOnly || true,
          });
        }

        return {
          db,
          pubsub,
          user: user || null,
          session: session || null,
          cookies: request.cookieStore,
        };
      } catch (error) {
        // If session validation fails, we'll have null user and session
        console.error('Session validation error:', error);
      }
    }

    // Return the context object
    return {
      db,
      pubsub,
      user: null,
      session: null,
      cookies: request.cookieStore,
    };
  },
});

const server = createServer(yoga);

server.listen(3000, () => {
  console.log('Server is running on http://localhost:4000');
});
