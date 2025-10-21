-- ================================================
-- Script SQL para crear la base de datos manualmente
-- (Alternativa a Prisma)
-- ================================================

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS inspecciones_postes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inspecciones_postes;

-- 2. Tabla de usuarios
CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'supervisor', 'tecnico') NOT NULL,
    companyId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de colores
CREATE TABLE IF NOT EXISTS Color (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) UNIQUE NOT NULL,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de postes
CREATE TABLE IF NOT EXISTS Poste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(191) UNIQUE NOT NULL,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    direccion VARCHAR(500) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    companyId INT NOT NULL,
    INDEX idx_codigo (codigo),
    INDEX idx_location (lat, lng),
    INDEX idx_company (companyId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de inspecciones
CREATE TABLE IF NOT EXISTS Inspeccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    posteId INT NOT NULL,
    tecnicoId INT NOT NULL,
    supervisorId INT NULL,
    fechaAsignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaEjecucion DATETIME NULL,
    estado VARCHAR(50) NOT NULL,
    altura DOUBLE NULL,
    estadoPintura VARCHAR(50) NULL,
    colorId INT NULL,
    funcionando BOOLEAN NULL,
    estadoBase VARCHAR(50) NULL,
    observaciones TEXT NULL,
    fotos TEXT NULL,
    latReal DOUBLE NULL,
    lngReal DOUBLE NULL,
    syncStatus VARCHAR(20) DEFAULT 'pending',
    lastModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_poste (posteId),
    INDEX idx_tecnico (tecnicoId),
    INDEX idx_supervisor (supervisorId),
    INDEX idx_estado (estado),
    INDEX idx_sync (syncStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Poblar datos iniciales

-- Insertar colores
INSERT INTO Color (name) VALUES 
    ('negro'),
    ('gris'),
    ('blanco'),
    ('amarillo')
ON DUPLICATE KEY UPDATE name=name;

-- Insertar usuario admin de prueba
-- Password: admin123 (hashed con bcrypt)
INSERT INTO User (email, name, password, role, companyId) VALUES 
    ('admin@test.com', 'Admin Test', '$2a$10$xQp8MxqYZHGYxpFpG7rHJeHzrJG8XvMxQ6nKMp3xQ7XqYpFpG7rHJ', 'admin', 1)
ON DUPLICATE KEY UPDATE name=name;

-- Insertar usuario técnico de prueba  
-- Password: tecnico123 (hashed con bcrypt)
INSERT INTO User (email, name, password, role, companyId) VALUES 
    ('tecnico@test.com', 'Técnico Test', '$2a$10$xQp8MxqYZHGYxpFpG7rHJeHzrJG8XvMxQ6nKMp3xQ7XqYpFpG7rHJ', 'tecnico', 1)
ON DUPLICATE KEY UPDATE name=name;

-- Insertar supervisor de prueba
-- Password: supervisor123
INSERT INTO User (email, name, password, role, companyId) VALUES 
    ('supervisor@test.com', 'Supervisor Test', '$2a$10$xQp8MxqYZHGYxpFpG7rHJeHzrJG8XvMxQ6nKMp3xQ7XqYpFpG7rHJ', 'supervisor', 1)
ON DUPLICATE KEY UPDATE name=name;

-- Insertar algunos postes de ejemplo
INSERT INTO Poste (codigo, lat, lng, direccion, tipo, companyId) VALUES 
    ('P-001', 4.6097, -74.0817, 'Calle 26 con Carrera 7', 'Metálico', 1),
    ('P-002', 4.6517, -74.0836, 'Calle 72 con Carrera 11', 'Concreto', 1),
    ('P-003', 4.6737, -74.0584, 'Calle 100 con Carrera 15', 'Metálico', 1)
ON DUPLICATE KEY UPDATE codigo=codigo;

-- ================================================
-- Verificación
-- ================================================

SELECT 'Base de datos creada exitosamente!' AS Status;
SELECT COUNT(*) AS 'Total Colores' FROM Color;
SELECT COUNT(*) AS 'Total Usuarios' FROM User;
SELECT COUNT(*) AS 'Total Postes' FROM Poste;

-- ================================================
-- Nota: Para ejecutar este script:
-- mysql -u usuario -p < schema.sql
-- ================================================
