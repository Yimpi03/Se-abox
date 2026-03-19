const { pool } = require('../../../config/db');

// Obtener todos los textos públicos (solo los activos)
const obtenerTextosPublicos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id, 
                titulo, 
                contenido, 
                categoria, 
                fecha_creacion,
                fecha_actualizacion,
                orden 
            FROM textos 
            WHERE estado = true 
            ORDER BY orden ASC, fecha_creacion DESC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener textos públicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los textos',
            error: error.message
        });
    }
};

// Obtener textos por categoría (solo activos)
const obtenerTextosPorCategoria = async (req, res) => {
    try {
        const { categoria } = req.params;
        
        const [rows] = await pool.query(
            'SELECT * FROM textos WHERE categoria = ? AND estado = true ORDER BY orden ASC',
            [categoria]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener textos por categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los textos',
            error: error.message
        });
    }
};

// Obtener un texto específico por ID (solo si está activo)
const obtenerTextoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM textos WHERE id = ? AND estado = true',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Texto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener texto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el texto',
            error: error.message
        });
    }
};

// Obtener resumen/estadísticas del contenido
const obtenerResumenContenido = async (req, res) => {
    try {
        // Total de textos activos
        const [total] = await pool.query(
            'SELECT COUNT(*) as total FROM textos WHERE estado = true'
        );
        
        // Textos por categoría
        const [porCategoria] = await pool.query(`
            SELECT 
                categoria, 
                COUNT(*) as cantidad 
            FROM textos 
            WHERE estado = true 
            GROUP BY categoria 
            ORDER BY cantidad DESC
        `);
        
        // Últimas actualizaciones
        const [ultimasActualizaciones] = await pool.query(`
            SELECT 
                id, 
                titulo, 
                categoria, 
                fecha_actualizacion 
            FROM textos 
            WHERE estado = true 
            ORDER BY fecha_actualizacion DESC 
            LIMIT 5
        `);
        
        res.json({
            success: true,
            data: {
                totalTextos: total[0].total,
                porCategoria: porCategoria,
                ultimasActualizaciones: ultimasActualizaciones
            }
        });
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el resumen',
            error: error.message
        });
    }
};

module.exports = {
    obtenerTextosPublicos,
    obtenerTextosPorCategoria,
    obtenerTextoPorId,
    obtenerResumenContenido
};