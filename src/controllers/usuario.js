const authenticateToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = (connection) => {
  return {
    usuario: async (req, res) => {
      const { rol_idrol, email, contraseña, fechacreacion, fechaactualizacion, idcreador, idactualizacion } = req.body;

      try {
        const [rolResult] = await connection.promise().query(
          'SELECT idrol FROM rol WHERE idrol = ?',
          [rol_idrol]
        );

        if (rolResult.length === 0) {
          return res.status(400).json({ message: 'El rol especificado no existe' });
        }

        const hashedPasswordBinary = Buffer.from(contraseña, 'utf8');

        const [result] = await connection.promise().query(
          'INSERT INTO usuario (rol_idrol, email, contraseña, fechacreacion, fechaactualizacion, idcreador, idactualizacion, eliminado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [rol_idrol, email, hashedPasswordBinary, fechacreacion, fechaactualizacion, idcreador, idactualizacion, 0]
        );

        res.status(201).json({ message: 'Usuario registrado', userId: result.insertId });
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
      }
    },
    consultar: async (req, res) => {
      try {
        const [rows] = await connection.promise().query('SELECT * FROM usuario WHERE eliminado = ?', [0]);
        res.status(200).json(rows);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error' });
      }
    },


    consultarId: async (req, res) => {
      const { id } = req.params;

      try {
        const [rows] = await connection.promise().query('SELECT * FROM usuario WHERE idusuario = ? AND eliminado = ?', [id, 0]);

        if (rows.length === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json(rows[0]);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error' });
      }
    },
    actualizarUsuario: async (req, res) => {
      const { id } = req.params;
      const { rol_idrol, email, contraseña, fechacreacion, fechaactualizacion, idcreador, idactualizacion } = req.body;

      try {
        let query = 'UPDATE usuario SET ';
        const updates = [];
        const params = [];

        if (rol_idrol) {
          updates.push('rol_idrol = ?');
          params.push(rol_idrol);
        }

        if (email) {
          updates.push('email = ?');
          params.push(email);
        }

        if (contraseña) {
          const hashedPasswordBinary = Buffer.from(contraseña, 'utf8');
          updates.push('contraseña = ?');
          params.push(hashedPasswordBinary);
        }

        if (idcreador) {
          updates.push('idcreador = ?');
          params.push(idcreador);
        }

        if (idactualizacion) {
          updates.push('idactualizacion = ?');
          params.push(idactualizacion);
        }

        if (fechacreacion) {
          updates.push('fechacreacion = ?');
          params.push(fechacreacion);
        }


        if (fechaactualizacion !== undefined) {
          updates.push('fechaactualizacion = ?');
          params.push(fechaactualizacion);
        }


        if (updates.length === 0) {
          return res.status(400).json({ message: 'Sin información' });
        }

        query += updates.join(', ') + ' WHERE idusuario = ?';
        params.push(id);

        const [result] = await connection.promise().query(query, params);

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Usuario no econtrado' });
        }

        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error' });
      }
    },
    login: async (req, res) => {
      const { email, contraseña } = req.body;

      try {
        const [rows] = await connection.promise().query(
          'SELECT idusuario, nombre, rol_idrol, email, contraseña FROM usuario INNER join rol on usuario.rol_idrol = rol.idrol WHERE email = ? AND usuario.eliminado = 0',
          [email]
        );

        if (rows.length === 0) {
          return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        const user = rows[0];


        const storedPassword = user.contraseña.toString('utf8').replace(/\x00/g, '');


        console.log('Contraseña almacenada:', JSON.stringify(storedPassword));
        console.log('Contraseña ingresada:', JSON.stringify(contraseña));

        if (contraseña.trim() !== storedPassword.trim()) {
          return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        const accessToken = jwt.sign(
          { idusuario: user.idusuario, email: user.email, rol_idrol: user.rol_idrol, nombre:user.nombre },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
          { idusuario: user.idusuario, email: user.email, rol_idrol: user.rol_idrol, nombre:user.nombre},
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );

        const fechaexpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

        const fechacreacion =new Date(Date.now());
        await connection.promise().query(
          'INSERT INTO refreshtoken (usuario_idusuario, token, fechaexpiracion, fechacreacion, eliminado) VALUES (?, ?, ?, ?, ?)',
          [user.idusuario, refreshToken, fechaexpiracion, fechacreacion, 0]
        );

        res.json({
          message: 'Login exitoso',
          accessToken,
          refreshToken,
          user: {
            idusuario: user.idusuario,
            email: user.email,
            rol_idrol: user.rol_idrol,
            nombre:user.nombre
          }
        });

      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
      }
    },
    eliminarUsuario: async (req, res) => {
      const { id } = req.params;

      try {
        const [result] = await connection.promise().query(
          'UPDATE usuario SET eliminado = ? WHERE idusuario = ?',
          [true, id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado lógicamente' });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error' });
      }
    },
    refreshToken: async (req, res) => {
      const { refreshToken } = req.body;
    
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token no proporcionado' });
      }
    
      try {
        const [rows] = await connection.promise().query(
          'SELECT * FROM refreshtoken WHERE token = ? AND fechaexpiracion > NOW() AND eliminado = 0',
          [refreshToken]
        );
    
        if (rows.length === 0) {
          return res.status(403).json({ message: 'Refresh token inválido, expirado o eliminado' });
        }
    
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
          if (err) {
            return res.status(403).json({ message: 'Refresh token inválido o expirado' });
          }
    
          const accessToken = jwt.sign(
            { idusuario: user.idusuario, email: user.email, rol_idrol: user.rol_idrol, nombre:user.nombre },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
          );
    
          res.json({ accessToken });
        });
      } catch (error) {
        console.error('Error al refrescar el token:', error);
        res.status(500).json({ message: 'Error en el servidor' });
      }
    },
    logout: async (req, res) => {
      const { refreshToken } = req.body;
    
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token no proporcionado' });
      }
    
      try {
        const [result] = await connection.promise().query(
          'UPDATE refreshtoken SET eliminado = 1 WHERE token = ?',
          [refreshToken]
        );
    
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Refresh token no encontrado' });
        }
    
        res.json({ message: 'Sesión cerrada exitosamente' });
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
      }
    }



  };
};