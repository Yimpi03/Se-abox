const express = require('express');
const router = express.Router();
const { pool } = require('../../../config/db');

// ===== RUTA DE PRUEBA =====
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: '✅ Ruta de números funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ===== RUTAS PRINCIPALES =====

// Obtener todos los números
router.get('/', async (req, res) => {
    try {
        console.log('📥 GET /api/admin/numeros - Solicitando todos los números');
        const [rows] = await pool.query('SELECT * FROM numeros ORDER BY numero');
        console.log(`📤 Enviando ${rows.length} números`);
        res.json(rows);
    } catch (error) {
        console.error('❌ Error en GET /:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener los números',
            error: error.message 
        });
    }
});

// Obtener un número por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📥 GET /api/admin/numeros/${id} - Solicitando número`);
        
        const [rows] = await pool.query('SELECT * FROM numeros WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Número no encontrado' 
            });
        }
        
        console.log(`📤 Enviando número ${id}`);
        res.json(rows[0]);
    } catch (error) {
        console.error(`❌ Error en GET /${req.params.id}:`, error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener el número',
            error: error.message 
        });
    }
});

// Crear nuevo número
router.post('/', async (req, res) => {
    try {
        const { numero, descripcion, activo, imagen_url } = req.body;
        console.log('📥 POST /api/admin/numeros - Creando nuevo número:', numero);

        // Verificar si el número ya existe
        const [existente] = await pool.query('SELECT id FROM numeros WHERE numero = ?', [numero]);
        
        if (existente.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'El número ya existe' 
            });
        }

        const [result] = await pool.query(
            'INSERT INTO numeros (numero, imagen_url, descripcion, activo) VALUES (?, ?, ?, ?)',
            [numero, imagen_url || '', descripcion, activo !== undefined ? activo : true]
        );

        console.log(`✅ Número ${numero} creado con ID: ${result.insertId}`);
        res.status(201).json({
            success: true,
            id: result.insertId,
            message: 'Número creado exitosamente'
        });
    } catch (error) {
        console.error('❌ Error en POST /:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al crear el número',
            error: error.message 
        });
    }
});

// Actualizar número
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { numero, descripcion, activo, imagen_url } = req.body;
        console.log(`📥 PUT /api/admin/numeros/${id} - Actualizando número`);

        // Verificar si el número existe
        const [actual] = await pool.query('SELECT * FROM numeros WHERE id = ?', [id]);
        
        if (actual.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Número no encontrado' 
            });
        }

        // Verificar si el número ya existe (excepto el actual)
        const [existente] = await pool.query(
            'SELECT id FROM numeros WHERE numero = ? AND id != ?', 
            [numero, id]
        );
        
        if (existente.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'El número ya existe' 
            });
        }

        await pool.query(
            'UPDATE numeros SET numero = ?, imagen_url = ?, descripcion = ?, activo = ? WHERE id = ?',
            [numero, imagen_url || actual[0].imagen_url, descripcion, activo, id]
        );

        console.log(`✅ Número ${id} actualizado`);
        res.json({
            success: true,
            message: 'Número actualizado exitosamente'
        });
    } catch (error) {
        console.error(`❌ Error en PUT /${req.params.id}:`, error);
        res.status(500).json({ 
            success: false,
            message: 'Error al actualizar el número',
            error: error.message 
        });
    }
});

// Eliminar número
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📥 DELETE /api/admin/numeros/${id} - Eliminando número`);

        const [result] = await pool.query('DELETE FROM numeros WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Número no encontrado' 
            });
        }

        console.log(`✅ Número ${id} eliminado`);
        res.json({ 
            success: true,
            message: 'Número eliminado exitosamente' 
        });
    } catch (error) {
        console.error(`❌ Error en DELETE /${req.params.id}:`, error);
        res.status(500).json({ 
            success: false,
            message: 'Error al eliminar el número',
            error: error.message 
        });
    }
});

// Verificar si un número existe
router.get('/verificar/:numero', async (req, res) => {
    try {
        const { numero } = req.params;
        const [rows] = await pool.query('SELECT id FROM numeros WHERE numero = ?', [numero]);
        
        res.json({ existe: rows.length > 0 });
    } catch (error) {
        console.error('❌ Error en verificar:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al verificar el número',
            error: error.message 
        });
    }
});

// Middleware para logging
router.use((req, res, next) => {
    console.log(`📡 [Numeros Route] ${req.method} ${req.url}`);
    next();
});

module.exports = router;