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


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar MySQL:', err);
    return;
  }
  console.log('Conectado');
});


app.use('/api', userRoutes(connection));
app.use('/api', rolRoutes(connection));
app.use('/api', empresaRoutes(connection));
app.use('/api', promocionRoutes(connection));
app.use('/api', notificacionRoutes(connection));
app.use('/api', guardadoRoutes(connection));
app.use('/api', categoriaRoutes(connection));
app.use('/api', metododepagoRoutes(connection));
app.use('/api', permisoRoutes(connection));
app.use('/api', clienteRoutes(connection));
app.use('/api', moduloRoutes(connection));
app.use('/api', movimientoRoutes(connection));
app.use('/api', tarjetaRoutes(connection));
app.use('/api', listadecategoriaRoutes(connection));

app.listen(port, () => {
  console.log(`Servidor ejecutandose en puerto: ${port}`);
});