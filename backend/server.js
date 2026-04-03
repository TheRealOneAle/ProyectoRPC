const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/connect', async (req, res) => {
    const { host, port, user, password } = req.body;
    
    console.log(`Intento de conexión a ${host}:${port} como ${user}`);

    const client = new Client({
        host,
        port: parseInt(port) || 5432,
        user,
        password,
        database: 'bkboca',
        connectionTimeoutMillis: 5000 
    });

    try {
        await client.connect();
        const resDb = await client.query('SELECT current_database();');
        await client.end();
        console.log('Conexión exitosa a la base de datos');
        res.json({ success: true, message: `Conectado de forma segura a la base de datos: ${resDb.rows[0].current_database}` });
    } catch (error) {
        console.error('Error de conexión:', error.message);
        res.status(500).json({ success: false, message: `Error de conexión: ${error.message}` });
    }
});

app.post('/api/query', async (req, res) => {
    const { host, port, user, password, query } = req.body;
    
    if (!query) {
        return res.status(400).json({ success: false, error: "No se proporcionó ninguna consulta SQL" });
    }

    console.log(`Ejecutando query en ${host}:${port}: ${query}`);

    const client = new Client({
        host,
        port: parseInt(port) || 5432,
        user,
        password,
        database: 'bkboca',
        connectionTimeoutMillis: 5000 
    });

    try {
        await client.connect();
        const result = await client.query(query);
        await client.end();
        res.json({ success: true, rows: result.rows, command: result.command, rowCount: result.rowCount });
    } catch (error) {
        console.error('Error de query:', error.message);
        res.status(500).json({ success: false, error: `Error ejecutando consulta: ${error.message}` });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`API intermediaria corriendo en http://localhost:${PORT}`);
});
