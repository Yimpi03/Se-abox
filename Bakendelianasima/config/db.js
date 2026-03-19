const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear el pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2025Elianadavid',
    database: process.env.DB_NAME || 'LENGUAJE_SENAS',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Base de datos conectada exitosamente');
        console.log(`📊 Base de datos: ${process.env.DB_NAME || 'LENGUAJE_SENAS'}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:');
        console.error(error.message);
        return false;
    }
};

module.exports = {
    pool,
    testConnection
};