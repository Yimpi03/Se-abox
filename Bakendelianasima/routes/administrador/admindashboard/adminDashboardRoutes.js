const express = require('express');
const router = express.Router();

// CORREGIDO: Cambiado de dashboardController a adminDashboardController
const dashboardController = require('../../../controllers/administrador/admindashboard/adminDashboardController');

// Middleware de autenticación (opcional - comentado por ahora)
// const { verificarToken } = require('../../../middlewares/authMiddleware');
// router.use(verificarToken);

/**
 * @swagger
 * tags:
 *   name: AdminDashboard
 *   description: Administración de textos del dashboard
 */

// ==================== RUTAS PARA TEXTOS ====================

/**
 * @route GET /api/admin/dashboard/textos
 * @desc Obtener todos los textos
 * @access Private
 */
router.get('/textos', dashboardController.obtenerTodosLosTextos);

/**
 * @route GET /api/admin/dashboard/textos/:id
 * @desc Obtener un texto por ID
 * @access Private
 */
router.get('/textos/:id', dashboardController.obtenerTextoPorId);

/**
 * @route GET /api/admin/dashboard/textos/categoria/:categoria
 * @desc Obtener textos por categoría
 * @access Private
 */
router.get('/textos/categoria/:categoria', dashboardController.obtenerTextosPorCategoria);

/**
 * @route POST /api/admin/dashboard/textos
 * @desc Crear un nuevo texto
 * @access Private
 */
router.post('/textos', dashboardController.crearTexto);

/**
 * @route PUT /api/admin/dashboard/textos/:id
 * @desc Actualizar un texto completo
 * @access Private
 */
router.put('/textos/:id', dashboardController.actualizarTexto);

/**
 * @route PATCH /api/admin/dashboard/textos/:id/estado
 * @desc Actualizar solo el estado de un texto
 * @access Private
 */
router.patch('/textos/:id/estado', dashboardController.actualizarEstadoTexto);

/**
 * @route DELETE /api/admin/dashboard/textos/:id
 * @desc Eliminar un texto
 * @access Private
 */
router.delete('/textos/:id', dashboardController.eliminarTexto);

/**
 * @route POST /api/admin/dashboard/textos/reordenar
 * @desc Reordenar textos
 * @access Private
 */
router.post('/textos/reordenar', dashboardController.reordenarTextos);

module.exports = router;