const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Puerto
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ===== SERVIDOR DE ARCHIVOS ESTÁTICOS (IMÁGENES) =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== RUTAS =====
const adminDashboardRoutes = require('./routes/administrador/admindashboard/adminDashboardRoutes');
const clienteDashboardRoutes = require('./routes/cliente/dashboard/dashboardRoutes');
const adminAbecedarioRoutes = require('./routes/administrador/adminabecedario/adminAbecedarioRoutes');
const adminNumerosRoutes = require('./routes/administrador/adminnumeros/adminNumerosRoutes'); // 👈 NUEVA RUTA PARA NÚMEROS

// Usar rutas
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/cliente/dashboard', clienteDashboardRoutes);
app.use('/api/admin/abecedario', adminAbecedarioRoutes);
app.use('/api/admin/numeros', adminNumerosRoutes); // 👈 NUEVA RUTA PARA NÚMEROS

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta para obtener información de la API
app.get('/api', (req, res) => {
    res.json({
        name: 'API Lenguaje de Señas',
        version: '1.0.0',
        endpoints: {
            textos: '/api/admin/dashboard/textos',
            abecedario: '/api/admin/abecedario/letras',
            numeros: '/api/admin/numeros', // 👈 NUEVO ENDPOINT
            health: '/api/health'
        }
    });
});

// Manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.warn('⚠️  El servidor continuará pero sin conexión a la base de datos');
        }
        
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
            console.log(`📝 Modo: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log('=================================');
            
            if (dbConnected) {
                console.log('✅ Estado: Conectado a la base de datos');
                console.log('📋 Endpoints disponibles:');
                console.log('   - /api/admin/dashboard');
                console.log('   - /api/admin/abecedario');
                console.log('   - /api/admin/numeros'); // 👈 NUEVO
                console.log('   - /api/cliente/dashboard');
                console.log('   - /api/health');
            } else {
                console.log('⚠️  Estado: Sin conexión a la base de datos');
            }
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Cerrando servidor...');
    process.exit(0);
});

startServer();