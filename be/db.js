const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_siswa',
    dateStrings: true,
};

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function initDatabase() {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.end();

    await pool.query(`
        CREATE TABLE IF NOT EXISTS siswa (
            kodeSiswa VARCHAR(20) PRIMARY KEY,
            namaSiswa VARCHAR(100) NOT NULL,
            alamatSiswa TEXT NOT NULL,
            ttl DATE NOT NULL,
            jurusan VARCHAR(50) NOT NULL
        )
    `);
}

initDatabase().catch((err) => {
    console.error('Gagal menginisialisasi database:', err.message);
});

module.exports = pool;
