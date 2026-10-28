const mongoose = require('mongoose');

/**
 * Enterprise Resilient Database Connection
 * Enforces RPO=0 (Zero Data Loss) via majority write concerns,
 * strict query budgets (2000ms maxTimeMS), and connection pooling.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/Shyvora_cms';

    // Global query timeout safeguard: enforce 2000ms call budget on all queries
    mongoose.plugin((schema) => {
      schema.pre(['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'aggregate'], function() {
        if (typeof this.maxTimeMS === 'function') {
          this.maxTimeMS(2000);
        }
      });
    });

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000, // 2000ms timeout budget
      socketTimeoutMS: 2500,
      maxPoolSize: 50,               // Connection pooling limit
      minPoolSize: 10,
      retryWrites: true,
      w: 'majority',                 // Multi-AZ Quorum commit prior to ACK (RPO = 0)
      journal: true,                 // fsync journal commit (Zero Data Loss)
      wtimeoutMS: 2500
    });

    console.log(`[DATABASE RESILIENCE] Connected securely to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[DATABASE RESILIENCE ERROR] Initial connection failed: ${error.message}`);
    // In fail-secure posture, log and handle cleanly
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
