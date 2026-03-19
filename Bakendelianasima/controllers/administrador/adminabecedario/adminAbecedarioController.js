const { pool } = require('../../../config/db');
const path = require('path');
const fs = require('fs');

// Obtener todas las letras
exports.getAllLetras = async (req, res) => {
    try {
        const [letras] = await pool.query(`
            SELECT 
                l.id,
                l.letra,
                l.titulo,
                l.instruccion,
                l.imagen_nombre,
                CONCAT('/uploads/signs/', l.imagen_nombre) as imagen_url,
                (SELECT COUNT(*) FROM tips WHERE letra_id = l.id) as total_tips
            FROM letras l
            ORDER BY l.letra
        `);

        res.json({
            success: true,
            data: letras
        });
    } catch (error) {
        console.error('Error al obtener letras:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las letras',
            error: error.message
        });
    }
};

// Obtener una letra por ID
exports.getLetraById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [letras] = await pool.query(`
            SELECT 
                l.*,
                CONCAT('/uploads/signs/', l.imagen_nombre) as imagen_url
            FROM letras l
            WHERE l.id = ?
        `, [id]);

        if (letras.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Letra no encontrada'
            });
        }

        // Obtener tips de la letra
        const [tips] = await pool.query(
            'SELECT id, tip FROM tips WHERE letra_id = ? ORDER BY id',
            [id]
        );

        const letra = letras[0];
        letra.tips = tips;

        res.json({
            success: true,
            data: letra
        });
    } catch (error) {
        console.error('Error al obtener letra:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la letra',
            error: error.message
        });
    }
};

// Obtener letra por letra (A, B, C...)
exports.getLetraByLetra = async (req, res) => {
    try {
        const { letra } = req.params;
        
        const [letras] = await pool.query(`
            SELECT 
                l.*,
                CONCAT('/uploads/signs/', l.imagen_nombre) as imagen_url
            FROM letras l
            WHERE l.letra = ?
        `, [letra]);

        if (letras.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Letra no encontrada'
            });
        }

        // Obtener tips de la letra
        const [tips] = await pool.query(
            'SELECT id, tip FROM tips WHERE letra_id = ? ORDER BY id',
            [letras[0].id]
        );

        const letraData = letras[0];
        letraData.tips = tips;

        res.json({
            success: true,
            data: letraData
        });
    } catch (error) {
        console.error('Error al obtener letra:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la letra',
            error: error.message
        });
    }
};

// Obtener tips de una letra
exports.getTipsByLetra = async (req, res) => {
    try {
        const { letraId } = req.params;
        
        const [tips] = await pool.query(
            'SELECT id, tip FROM tips WHERE letra_id = ? ORDER BY id',
            [letraId]
        );

        res.json({
            success: true,
            data: tips
        });
    } catch (error) {
        console.error('Error al obtener tips:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los tips',
            error: error.message
        });
    }
};

// Actualizar instrucción de una letra
exports.updateInstruccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { instruccion } = req.body;

        if (!instruccion) {
            return res.status(400).json({
                success: false,
                message: 'La instrucción es requerida'
            });
        }

        await pool.query(
            'UPDATE letras SET instruccion = ? WHERE id = ?',
            [instruccion, id]
        );

        res.json({
            success: true,
            message: 'Instrucción actualizada correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar instrucción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la instrucción',
            error: error.message
        });
    }
};

// Actualizar título de una letra
exports.updateTitulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo } = req.body;

        if (!titulo) {
            return res.status(400).json({
                success: false,
                message: 'El título es requerido'
            });
        }

        await pool.query(
            'UPDATE letras SET titulo = ? WHERE id = ?',
            [titulo, id]
        );

        res.json({
            success: true,
            message: 'Título actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar título:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el título',
            error: error.message
        });
    }
};

// Agregar un tip
exports.addTip = async (req, res) => {
    try {
        const { letraId, tip } = req.body;

        if (!letraId || !tip) {
            return res.status(400).json({
                success: false,
                message: 'letraId y tip son requeridos'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO tips (letra_id, tip) VALUES (?, ?)',
            [letraId, tip]
        );

        res.json({
            success: true,
            message: 'Tip agregado correctamente',
            data: {
                id: result.insertId,
                tip
            }
        });
    } catch (error) {
        console.error('Error al agregar tip:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar el tip',
            error: error.message
        });
    }
};

// Eliminar un tip
exports.deleteTip = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM tips WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Tip eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar tip:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el tip',
            error: error.message
        });
    }
};

// Subir imagen
exports.uploadImagen = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se subió ningún archivo'
            });
        }

        const { letra } = req.body;
        
        if (!letra) {
            return res.status(400).json({
                success: false,
                message: 'La letra es requerida'
            });
        }

        const nombreArchivo = req.file.filename;

        await pool.query(
            'UPDATE letras SET imagen_nombre = ? WHERE letra = ?',
            [nombreArchivo, letra]
        );

        res.json({
            success: true,
            message: 'Imagen subida correctamente',
            data: {
                imagen_nombre: nombreArchivo,
                imagen_url: `/uploads/signs/${nombreArchivo}`
            }
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir la imagen',
            error: error.message
        });
    }
};

// Eliminar imagen
exports.deleteImagen = async (req, res) => {
    try {
        const { letra } = req.params;

        // Obtener nombre de la imagen actual
        const [letras] = await pool.query(
            'SELECT imagen_nombre FROM letras WHERE letra = ?',
            [letra]
        );

        if (letras.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Letra no encontrada'
            });
        }

        const imagen_nombre = letras[0].imagen_nombre;

        if (imagen_nombre) {
            // Eliminar archivo físico
            const filePath = path.join(__dirname, '../../../uploads/signs', imagen_nombre);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Imagen eliminada: ${imagen_nombre}`);
            }
        }

        // Actualizar base de datos
        await pool.query(
            'UPDATE letras SET imagen_nombre = NULL WHERE letra = ?',
            [letra]
        );

        res.json({
            success: true,
            message: 'Imagen eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la imagen',
            error: error.message
        });
    }
};

// Obtener estadísticas
exports.getEstadisticas = async (req, res) => {
    try {
        const [[total]] = await pool.query('SELECT COUNT(*) as total FROM letras');
        const [[conImagen]] = await pool.query('SELECT COUNT(*) as total FROM letras WHERE imagen_nombre IS NOT NULL');
        const [[totalTips]] = await pool.query('SELECT COUNT(*) as total FROM tips');

        res.json({
            success: true,
            data: {
                total_letras: total.total,
                con_imagen: conImagen.total,
                sin_imagen: total.total - conImagen.total,
                total_tips: totalTips.total
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};