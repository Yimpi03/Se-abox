const { pool } = require('../../../config/db'); // Cambiado de database a db

const fs = require('fs');
const path = require('path');

const adminNumerosController = {
    // Obtener todos los números
    getNumeros: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM numeros ORDER BY numero');
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener números:', error);
            res.status(500).json({ 
                mensaje: 'Error al obtener los números',
                error: error.message 
            });
        }
    },

    // Obtener un número por ID
    getNumeroById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.query('SELECT * FROM numeros WHERE id = ?', [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ mensaje: 'Número no encontrado' });
            }
            
            res.json(rows[0]);
        } catch (error) {
            console.error('Error al obtener número:', error);
            res.status(500).json({ 
                mensaje: 'Error al obtener el número',
                error: error.message 
            });
        }
    },

    // Crear nuevo número
    crearNumero: async (req, res) => {
        try {
            const { numero, descripcion, activo } = req.body;
            let imagen_url = '';

            // Si hay archivo de imagen
            if (req.file) {
                imagen_url = `/uploads/numeros/${req.file.filename}`;
            }

            // Verificar si el número ya existe
            const [existente] = await pool.query('SELECT id FROM numeros WHERE numero = ?', [numero]);
            
            if (existente.length > 0) {
                // Si hay imagen subida, eliminarla
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ mensaje: 'El número ya existe' });
            }

            const [result] = await pool.query(
                'INSERT INTO numeros (numero, imagen_url, descripcion, activo) VALUES (?, ?, ?, ?)',
                [numero, imagen_url, descripcion, activo !== undefined ? activo : true]
            );

            res.status(201).json({
                id: result.insertId,
                numero,
                imagen_url,
                descripcion,
                activo: activo !== undefined ? activo : true,
                mensaje: 'Número creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear número:', error);
            // Si hay error y se subió imagen, eliminarla
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ 
                mensaje: 'Error al crear el número',
                error: error.message 
            });
        }
    },

    // Actualizar número
    actualizarNumero: async (req, res) => {
        try {
            const { id } = req.params;
            const { numero, descripcion, activo } = req.body;
            
            // Obtener el número actual para verificar imagen existente
            const [actual] = await pool.query('SELECT * FROM numeros WHERE id = ?', [id]);
            
            if (actual.length === 0) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(404).json({ mensaje: 'Número no encontrado' });
            }

            let imagen_url = actual[0].imagen_url;

            // Si hay nueva imagen
            if (req.file) {
                // Eliminar imagen anterior si existe
                if (actual[0].imagen_url) {
                    const oldImagePath = path.join(__dirname, '../../../public', actual[0].imagen_url);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                imagen_url = `/uploads/numeros/${req.file.filename}`;
            }

            // Verificar si el número ya existe (excepto el actual)
            const [existente] = await pool.query(
                'SELECT id FROM numeros WHERE numero = ? AND id != ?', 
                [numero, id]
            );
            
            if (existente.length > 0) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ mensaje: 'El número ya existe' });
            }

            await pool.query(
                'UPDATE numeros SET numero = ?, imagen_url = ?, descripcion = ?, activo = ? WHERE id = ?',
                [numero, imagen_url, descripcion, activo, id]
            );

            res.json({
                id: parseInt(id),
                numero,
                imagen_url,
                descripcion,
                activo,
                mensaje: 'Número actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar número:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            res.status(500).json({ 
                mensaje: 'Error al actualizar el número',
                error: error.message 
            });
        }
    },

    // Eliminar número
    eliminarNumero: async (req, res) => {
        try {
            const { id } = req.params;

            // Obtener información del número para eliminar la imagen
            const [numero] = await pool.query('SELECT imagen_url FROM numeros WHERE id = ?', [id]);
            
            if (numero.length === 0) {
                return res.status(404).json({ mensaje: 'Número no encontrado' });
            }

            // Eliminar imagen si existe
            if (numero[0].imagen_url) {
                const imagePath = path.join(__dirname, '../../../public', numero[0].imagen_url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Eliminar registro
            await pool.query('DELETE FROM numeros WHERE id = ?', [id]);

            res.json({ mensaje: 'Número eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar número:', error);
            res.status(500).json({ 
                mensaje: 'Error al eliminar el número',
                error: error.message 
            });
        }
    },

    // Subir imagen (endpoint específico)
    subirImagen: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });
            }

            const imagen_url = `/uploads/numeros/${req.file.filename}`;
            res.json({ imagen_url });
        } catch (error) {
            console.error('Error al subir imagen:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            res.status(500).json({ 
                mensaje: 'Error al subir la imagen',
                error: error.message 
            });
        }
    },

    // Verificar si un número existe
    verificarExistencia: async (req, res) => {
        try {
            const { numero } = req.params;
            const [rows] = await pool.query('SELECT id FROM numeros WHERE numero = ?', [numero]);
            
            res.json({ existe: rows.length > 0 });
        } catch (error) {
            console.error('Error al verificar número:', error);
            res.status(500).json({ 
                mensaje: 'Error al verificar el número',
                error: error.message 
            });
        }
    },

    // Cambiar estado (activar/desactivar)
    cambiarEstado: async (req, res) => {
        try {
            const { id } = req.params;
            const { activo } = req.body;

            const [result] = await pool.query(
                'UPDATE numeros SET activo = ? WHERE id = ?',
                [activo, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'Número no encontrado' });
            }

            res.json({ 
                mensaje: `Número ${activo ? 'activado' : 'desactivado'} exitosamente` 
            });
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            res.status(500).json({ 
                mensaje: 'Error al cambiar el estado',
                error: error.message 
            });
        }
    }
};

module.exports = adminNumerosController;