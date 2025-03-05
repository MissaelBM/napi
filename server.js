const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const authenticateToken = require('./src/middleware/auth');
require('dotenv').config();
const userRoutes = require('./src/routes/usuario');
const rolRoutes = require('./src/routes/rol');
const empresaRoutes = require('./src/routes/empresa');
const promocionRoutes = require('./src/routes/promocion');
const notificacionRoutes = require('./src/routes/notificacion');
const guardadoRoutes = require('./src/routes/guardado');
const categoriaRoutes = require('./src/routes/categoria');
const metododepagoRoutes = require('./src/routes/metododepago');
const permisoRoutes = require('./src/routes/permiso');
const clienteRoutes = require('./src/routes/cliente');
const moduloRoutes = require('./src/routes/modulo');
const movimientoRoutes = require('./src/routes/movimiento');
const tarjetaRoutes = require('./src/routes/tarjeta');
const listadecategoriaRoutes = require('./src/routes/listadecategoria');
const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
  connection.release(); 
});

app.use('/api', userRoutes(pool));
app.use('/api', rolRoutes(pool));
app.use('/api', empresaRoutes(pool));
app.use('/api', promocionRoutes(pool));
app.use('/api', notificacionRoutes(pool));
app.use('/api', guardadoRoutes(pool));
app.use('/api', categoriaRoutes(pool));
app.use('/api', metododepagoRoutes(pool));
app.use('/api', permisoRoutes(pool));
app.use('/api', clienteRoutes(pool));
app.use('/api', moduloRoutes(pool));
app.use('/api', movimientoRoutes(pool));
app.use('/api', tarjetaRoutes(pool));
app.use('/api', listadecategoriaRoutes(pool));

app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto: ${port}`);
});