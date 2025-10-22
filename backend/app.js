"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./src/routes/auth"));
const colores_1 = __importDefault(require("./src/routes/colores"));
const inspecciones_1 = __importDefault(require("./src/routes/inspecciones"));
const users_1 = __importDefault(require("./src/routes/users"));
const postes_1 = __importDefault(require("./src/routes/postes"));
const connection_1 = __importDefault(require("./src/db/connection"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Health check básico
app.get('/', (req, res) => res.send('API is running'));
// Health check completo con DB
app.get('/health', async (req, res) => {
    try {
        // Verificar conexión a la base de datos
        const [rows] = await connection_1.default.query('SELECT 1 as ok');
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            service: 'inspecciones-postes-api',
            version: '0.1.0'
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Rutas
app.use('/auth', auth_1.default);
app.use('/users', users_1.default);
app.use('/colores', colores_1.default);
app.use('/postes', postes_1.default);
app.use('/inspecciones', inspecciones_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
