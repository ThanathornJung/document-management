import { config } from 'mssql'; // Import config directly

export const sqlConfig: config = { // Use config type
  server: process.env.AZURE_SQL_SERVER || '',
  database: process.env.AZURE_SQL_DATABASE || '',
  authentication: {
    type: 'default', // SQL Server Authentication
    options: {
      userName: process.env.AZURE_SQL_USERNAME || '',
      password: process.env.AZURE_SQL_PASSWORD || '',
    },
  },
  options: {
    encrypt: true, // Use true for Azure SQL Database
    trustServerCertificate: false, // As per JDBC string
    connectTimeout: 120000, // 120 seconds
    requestTimeout: 120000, // 120 seconds
    // You can add other options here like requestTimeout, connectTimeout, etc.
  },
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Remove connections after 30 seconds of inactivity
    acquireTimeoutMillis: 30000, // Try to acquire a connection for 30 seconds before timing out
  },
};