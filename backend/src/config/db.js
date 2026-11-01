import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[Database] Connecting to MongoDB at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] Warning: Failed to connect to configured MONGODB_URI: ${err.message}`);
      console.log('[Database] Falling back to self-contained in-memory MongoDB for local development/testing...');
    }
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    console.log(`[Database] Starting In-Memory MongoDB Server at: ${memoryUri}`);
    const conn = await mongoose.connect(memoryUri);
    console.log('[Database] In-Memory MongoDB Connected successfully.');
    return conn;
  } catch (memErr) {
    console.error(`[Database] Fatal Error connecting to MongoDB: ${memErr.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error(`[Database] Disconnect error: ${err.message}`);
  }
};
