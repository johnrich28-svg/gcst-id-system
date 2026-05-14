import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Start Express App
    app.listen(ENV.PORT, () => {
      logger.info(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
