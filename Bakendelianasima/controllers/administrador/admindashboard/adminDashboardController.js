const { pool } = require('../../../config/db');

// Obtener todos los textos
const obtenerTodosLosTextos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id, 
                titulo, 
                contenido, 
                categoria, 
                fecha_creacion,
                fecha_actualizacion,
                estado,
                orden 
            FROM textos 
            ORDER BY orden ASC, fecha_creacion DESC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener textos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los textos',
            error: error.message
        });
    }
};

// Obtener un texto por ID
const obtenerTextoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM textos WHERE id = ?',
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

// Crear un nuevo texto
const crearTexto = async (req, res) => {
    try {
        const { titulo, contenido, categoria, estado, orden } = req.body;
        
        // Validar campos requeridos
        if (!titulo || !contenido) {
            return res.status(400).json({
                success: false,
                message: 'El título y contenido son obligatorios'
            });
        }
        
        // Si no se proporciona orden, obtener el siguiente número
        let ordenFinal = orden;
        if (!ordenFinal) {
            const [maxOrden] = await pool.query(
                'SELECT MAX(orden) as maxOrden FROM textos'
            );
            ordenFinal = (maxOrden[0].maxOrden || 0) + 1;
        }
        
        const [result] = await pool.query(
            `INSERT INTO textos 
            (titulo, contenido, categoria, estado, orden) 
            VALUES (?, ?, ?, ?, ?)`,
            [
                titulo, 
                contenido, 
                categoria || 'general', 
                estado !== undefined ? estado : true,
                ordenFinal
            ]
        );
        
        const [nuevoTexto] = await pool.query(
            'SELECT * FROM textos WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Texto creado exitosamente',
            data: nuevoTexto[0]
        });
    } catch (error) {
        console.error('Error al crear texto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el texto',
            error: error.message
        });
    }
};

// Actualizar un texto
const actualizarTexto = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, categoria, estado, orden } = req.body;
        
        // Verificar si el texto existe
        const [textoExistente] = await pool.query(
            'SELECT id FROM textos WHERE id = ?',
            [id]
        );
        
        if (textoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Texto no encontrado'
            });
        }
        
        // Construir la consulta de actualización
        const camposActualizar = [];
        const valores = [];
        
        if (titulo !== undefined) {
            camposActualizar.push('titulo = ?');
            valores.push(titulo);
        }
        if (contenido !== undefined) {
            camposActualizar.push('contenido = ?');
            valores.push(contenido);
        }
        if (categoria !== undefined) {
            camposActualizar.push('categoria = ?');
            valores.push(categoria);
        }
        if (estado !== undefined) {
            camposActualizar.push('estado = ?');
            valores.push(estado);
        }
        if (orden !== undefined) {
            camposActualizar.push('orden = ?');
            valores.push(orden);
        }
        
        // Siempre actualizar la fecha de modificación
        camposActualizar.push('fecha_actualizacion = CURRENT_TIMESTAMP');
        
        valores.push(id);
        
        await pool.query(
            `UPDATE textos SET ${camposActualizar.join(', ')} WHERE id = ?`,
            valores
        );
        
        const [textoActualizado] = await pool.query(
            'SELECT * FROM textos WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Texto actualizado exitosamente',
            data: textoActualizado[0]
        });
    } catch (error) {
        console.error('Error al actualizar texto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el texto',
            error: error.message
        });
    }
};

// Eliminar un texto
const eliminarTexto = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el texto existe
        const [textoExistente] = await pool.query(
            'SELECT id FROM textos WHERE id = ?',
            [id]
        );
        
        if (textoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Texto no encontrado'
            });
        }
        
        await pool.query('DELETE FROM textos WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Texto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar texto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el texto',
            error: error.message
        });
    }
};

// Actualizar estado del texto
const actualizarEstadoTexto = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        if (estado === undefined) {
            return res.status(400).json({
                success: false,
                message: 'El estado es requerido'
            });
        }
        
        const [result] = await pool.query(
            'UPDATE textos SET estado = ? WHERE id = ?',
            [estado, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Texto no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: `Texto ${estado ? 'activado' : 'desactivado'} exitosamente`
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado',
            error: error.message
        });
    }
};

// Obtener textos por categoría
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

// Reordenar textos
const reordenarTextos = async (req, res) => {
    try {
        const { textos } = req.body;
        
        if (!Array.isArray(textos)) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de textos'
            });
        }
        
        for (const texto of textos) {
            await pool.query(
                'UPDATE textos SET orden = ? WHERE id = ?',
                [texto.orden, texto.id]
            );
        }
        
        res.json({
            success: true,
            message: 'Orden actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al reordenar textos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al reordenar los textos',
            error: error.message
        });
    }
};

// Exportar todas las funciones
module.exports = {
    obtenerTodosLosTextos,
    obtenerTextoPorId,
    crearTexto,
    actualizarTexto,
    eliminarTexto,
    actualizarEstadoTexto,
    obtenerTextosPorCategoria,
    reordenarTextos
};