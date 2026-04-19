import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({ 
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,  
    connectionLimit: 10,        
    queueLimit: 0 
});

// Prueba de conexión
(async () => {
    try {
        const conn = await pool.getConnection(); 
        console.log('Conectado correctamente a MySQL');
        conn.release();
    } catch (error) {
        console.error('Error en la conexion: ', error);
    }
})();