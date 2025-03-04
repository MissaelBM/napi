module.exports = (connection) => {
    return {
        consultar: async (req, res) => {
            try {

                const [rows] = await connection.promise().query('SELECT * FROM promocion WHERE eliminado = ?', [0]);
                res.status(200).json(rows);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Error' });
            }
        },

        consultarId: async (req, res) => {
            const { id } = req.params;

            try {

                const [rows] = await connection.promise().query('SELECT * FROM promocion WHERE idpromocion = ? AND eliminado = ?', [id, 0]);

                if (rows.length === 0) {
                    return res.status(404).json({ message: 'Promoción no encontrada' });
                }

                res.status(200).json(rows[0]);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Error' });
            }
        },

        promocion: async (req, res) => {
            const { empresa_idempresa, categoria_idcategoria, nombre, descripcion, precio, vigenciainicio, vigenciafin, tipo } = req.body;

            try {
                const [empresaResult] = await connection.promise().query(
                    'SELECT idempresa FROM empresa WHERE idempresa = ?',
                    [empresa_idempresa]
                );
        
                if (empresaResult.length === 0) {
                    return res.status(400).json({ message: 'La empresa especificada no existe' });
                }

                const [categoriaResult] = await connection.promise().query(
                    'SELECT idcategoria FROM categoria WHERE idcategoria = ?',
                    [categoria_idcategoria]
                );
        
                if (categoriaResult.length === 0) {
                    return res.status(400).json({ message: 'La categoría especificada no existe' });
                }


                const [result] = await connection.promise().query(
                    'INSERT INTO promocion (empresa_idempresa, categoria_idcategoria, nombre, descripcion, precio, vigenciainicio, vigenciafin, tipo, eliminado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [empresa_idempresa, categoria_idcategoria, nombre, descripcion, precio, vigenciainicio, vigenciafin, tipo, 0]
                );

                res.status(201).json({ message: 'Promoción registrada', promocionId: result.insertId });
            } catch (error) {
                console.error('Error al registrar promoción:', error);
                res.status(500).json({ message: 'Error al registrar promoción' });
            }
        },

        actualizarPromocion: async (req, res) => {
            const { id } = req.params;
            const { empresa_idempresa, categoria_idcategoria, nombre, descripcion, precio, vigenciainicio, vigenciafin, tipo } = req.body;

            try {
                let query = 'UPDATE promocion SET ';
                const updates = [];
                const params = [];

                if (empresa_idempresa) {
                    updates.push('empresa_idempresa = ?');
                    params.push(empresa_idempresa);
                }
                if (categoria_idcategoria) {
                    updates.push('categoria_idcategoria = ?');
                    params.push(categoria_idcategoria);
                }

                if (nombre) {
                    updates.push('nombre = ?');
                    params.push(nombre);
                }

                if (descripcion) {
                    updates.push('descripcion = ?');
                    params.push(descripcion);
                }

                if (precio) {
                    updates.push('precio = ?');
                    params.push(precio);
                }

                if (vigenciainicio) {
                    updates.push('vigenciainicio = ?');
                    params.push(vigenciainicio);
                }

                if (vigenciafin) {
                    updates.push('vigenciafin = ?');
                    params.push(vigenciafin);
                }

                if (tipo) {
                    updates.push('tipo = ?');
                    params.push(tipo);
                }

                if (updates.length === 0) {
                    return res.status(400).json({ message: 'Sin información' });
                }

                query += updates.join(', ') + ' WHERE idpromocion = ?';
                params.push(id);

                const [result] = await connection.promise().query(query, params);

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Promoción no encontrada' });
                }

                res.status(200).json({ message: 'Promoción actualizada exitosamente' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Error' });
            }
        },

        eliminarPromocion: async (req, res) => {
            const { id } = req.params;

            try {

                const [result] = await connection.promise().query(
                    'UPDATE promocion SET eliminado = ? WHERE idpromocion = ?',
                    [1, id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Promoción no encontrada' });
                }

                res.status(200).json({ message: 'Promoción eliminada lógicamente' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ message: 'Error' });
            }
        }
    };
};