import { createServer } from 'node:http';
import { yoga } from './api';

// Create a standard Node.js HTTP server
const server = createServer(yoga.handle);
const port = process.env.PORT || 3000;

// Start the server
server.listen(port, () => {
  console.log(`API server running at http://localhost:${port}/api/graphql`);
});

// For hot module replacement with Vite
if (import.meta.hot) {
  import.meta.hot.accept('./api', (_newModule) => {
    console.log('🔄 API server code updated, reloading...');
  });
} 