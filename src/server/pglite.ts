import { createServer, Socket } from 'node:net';
import { DuplexStream, PostgresConnection } from 'pg-gateway';

// Create a TCP server
const server = createServer((socket) => {
  // `PostgresConnection` will manage the protocol lifecycle
  const connection = new PostgresConnection(
    convertToDuplexStream(socket),
    {
      auth: {
        method: 'password',
        validateCredentials: async (credentials) => {
          console.log({ credentials });
          return true;
        },
        getClearTextPassword: async (credentials) => {
          console.log({ credentials });
          return credentials.username;
        },
      },
      async onStartup({ clientParams }) {
        console.log({ clientParams });
      },
    },
  );

  return connection.duplex
});

// Listen on the desired port
server.listen(5432, () => {
  console.log('Server listening on port 5432');
});

function convertToDuplexStream(socket: Socket): DuplexStream<Uint8Array> {
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      socket.on('data', (chunk) => {
        controller.enqueue(chunk);
        console.log('data', chunk);
      });
      socket.on('end', () => {
        controller.close();
      });
      socket.on('error', (err) => {
        controller.error(err);
      });
    },
  });
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      socket.write(chunk);
    },
  });
  return {
    readable,
    writable,
  };
}