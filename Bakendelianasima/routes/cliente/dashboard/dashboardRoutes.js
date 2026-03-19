const express = require('express');
const router = express.Router();
const dashboardController = require('../../../controllers/cliente/dashboard/dashboardController');

/**
 * @route GET /api/cliente/dashboard/textos
 * @desc Obtener todos los textos públicos (activos)
 * @access Public
 */
router.get('/textos', dashboardController.obtenerTextosPublicos);

/**
 * @route GET /api/cliente/dashboard/textos/categoria/:categoria
 * @desc Obtener textos por categoría (solo activos)
 * @access Public
 */
router.get('/textos/categoria/:categoria', dashboardController.obtenerTextosPorCategoria);

/**
 * @route GET /api/cliente/dashboard/textos/:id
 * @desc Obtener un texto específico por ID
 * @access Public
 */
router.get('/textos/:id', dashboardController.obtenerTextoPorId);

/**
 * @route GET /api/cliente/dashboard/resumen
 * @desc Obtener resumen del contenido
 * @access Public
 */
router.get('/resumen', dashboardController.obtenerResumenContenido);

module.exports = router;