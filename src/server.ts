import app from './app';
import { closeDB, connectDB } from './config/db';
import { env } from './config/env';

const start = async () => {
  // Fail fast: don't accept traffic if the database is unreachable.
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });

  // Graceful shutdown
  // const shutdown = () => {
  //   console.log('Shutting down...');
  //   server.close(async () => {
  //     await closeDB();
  //     process.exit(0);
  //   });
  // };
  // process.on('SIGINT', shutdown);
  // process.on('SIGTERM', shutdown);
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
