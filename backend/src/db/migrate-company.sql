-- Migración: Agregar tabla Company
-- Ejecutar en producción (Heroku)

CREATE TABLE IF NOT EXISTS Company (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  phone VARCHAR(50),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear empresa por defecto si no existe ninguna
INSERT INTO Company (name, address, phone) 
SELECT 'Empresa Principal', 'Por definir', '000000000'
WHERE NOT EXISTS (SELECT 1 FROM Company LIMIT 1);
