import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/schema',
  out: './src/lib/migrations',
  driver: 'pglite',
  dbCredentials: {
    url: './dev.db'
  }
})
