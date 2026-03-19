const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminAbecedarioController = require('../../../controllers/administrador/adminabecedario/adminAbecedarioController');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../../uploads/signs');
        // Crear la carpeta si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const letra = req.body.letra || 'unknown';
        const extension = path.extname(file.originalname);
        // Determinar si usar mayúscula o minúscula
        const letrasMayuscula = ['A'];
        const nombreArchivo = letrasMayuscula.includes(letra) ? letra : letra.toLowerCase();
        cb(null, `${nombreArchivo}${extension}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)'));
        }
    }
});

// ===== RUTAS PRINCIPALES =====

// GET /api/admin/abecedario/letras - Obtener todas las letras
router.get('/letras', adminAbecedarioController.getAllLetras);

// GET /api/admin/abecedario/letras/:id - Obtener letra por ID
router.get('/letras/:id', adminAbecedarioController.getLetraById);

// GET /api/admin/abecedario/letra/:letra - Obtener letra por letra (A, B, C...)
router.get('/letra/:letra', adminAbecedarioController.getLetraByLetra);

// GET /api/admin/abecedario/tips/:letraId - Obtener tips de una letra
router.get('/tips/:letraId', adminAbecedarioController.getTipsByLetra);

// GET /api/admin/abecedario/estadisticas - Obtener estadísticas
router.get('/estadisticas', adminAbecedarioController.getEstadisticas);

// PUT /api/admin/abecedario/letras/:id/instruccion - Actualizar instrucción
router.put('/letras/:id/instruccion', adminAbecedarioController.updateInstruccion);

// PUT /api/admin/abecedario/letras/:id/titulo - Actualizar título
router.put('/letras/:id/titulo', adminAbecedarioController.updateTitulo);

// POST /api/admin/abecedario/tips - Agregar tip
router.post('/tips', adminAbecedarioController.addTip);

// DELETE /api/admin/abecedario/tips/:id - Eliminar tip
router.delete('/tips/:id', adminAbecedarioController.deleteTip);

// POST /api/admin/abecedario/upload - Subir imagen
router.post('/upload', upload.single('imagen'), adminAbecedarioController.uploadImagen);

// DELETE /api/admin/abecedario/imagen/:letra - Eliminar imagen
router.delete('/imagen/:letra', adminAbecedarioController.deleteImagen);

// Manejo de errores de multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Máximo 5MB'
            });
        }
    }
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next();
});

module.exports = router;