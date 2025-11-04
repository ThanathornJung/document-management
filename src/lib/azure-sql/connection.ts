import { config } from 'mssql'; // Import config directly

export const sqlConfig: config = { // Use config type
  server: process.env.AZURE_SQL_SERVER || 'sql-documentapi.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'document_management_db',
  authentication: {
    type: 'default', // SQL Server Authentication
    options: {
      userName: process.env.AZURE_SQL_USERNAME || 'sqladmin@sql-documentapi',
      password: process.env.AZURE_SQL_PASSWORD || 'BaVeBoSs123@', // IMPORTANT: Use environment variable for production
    },
  },
  options: {
    encrypt: true, // Use true for Azure SQL Database
    trustServerCertificate: false, // As per JDBC string
    connectTimeout: 60000, // 60 seconds
    requestTimeout: 60000, // 60 seconds
    // You can add other options here like requestTimeout, connectTimeout, etc.
  },
};