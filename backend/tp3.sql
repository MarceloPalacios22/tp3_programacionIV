-- TP3 - Gestión de vehículos, conductores y viajes
-- Definición de tablas y datos de prueba

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS tp3 CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE tp3;

DROP TABLE IF EXISTS viajes;
DROP TABLE IF EXISTS conductores;
DROP TABLE IF EXISTS vehiculos;
DROP TABLE IF EXISTS usuarios;

-- Usuarios del sistema (la contraseña se guarda hasheada con bcrypt)
CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email)
);

-- Vehículos de la empresa
CREATE TABLE vehiculos (
  id INT NOT NULL AUTO_INCREMENT,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  patente VARCHAR(7) NOT NULL,
  anio INT NOT NULL,
  capacidad_carga DECIMAL(10,2) NOT NULL COMMENT 'Capacidad de carga en kg',
  PRIMARY KEY (id),
  UNIQUE KEY uk_vehiculos_patente (patente)
);

-- Conductores
CREATE TABLE conductores (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  dni VARCHAR(8) NOT NULL,
  numero_licencia VARCHAR(20) NOT NULL,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_conductores_dni (dni),
  UNIQUE KEY uk_conductores_licencia (numero_licencia)
);

-- Viajes (cada viaje asocia un vehículo y un conductor)
CREATE TABLE viajes (
  id INT NOT NULL AUTO_INCREMENT,
  vehiculo_id INT NOT NULL,
  conductor_id INT NOT NULL,
  fecha_salida DATE NOT NULL,
  fecha_llegada DATE NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  kilometros DECIMAL(10,2) NOT NULL,
  observaciones VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_viajes_vehiculo (vehiculo_id),
  KEY idx_viajes_conductor (conductor_id),
  CONSTRAINT fk_viajes_vehiculo FOREIGN KEY (vehiculo_id)
    REFERENCES vehiculos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_viajes_conductor FOREIGN KEY (conductor_id)
    REFERENCES conductores (id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ===================== Datos de prueba =====================

-- Usuario de prueba: email demo@tp3.com / contraseña demo1234
INSERT INTO usuarios (nombre, email, password) VALUES
('Demo', 'demo@tp3.com', '$2b$12$aaL8mRXHxbaPR8elstbqhe75d79JZXM18CqJOwRodTYysEMfECqWK');

INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES
('Mercedes-Benz', 'Sprinter 515', 'AB123CD', 2021, 3500.00),
('Iveco', 'Daily 70C', 'AC456EF', 2022, 4200.00),
('Ford', 'Cargo 1723', 'KLM789', 2012, 12000.00);

INSERT INTO conductores (nombre, apellido, dni, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) VALUES
('Juan', 'Pérez', '30123456', 'LR30123456', '2020-03-15', '2030-03-15'),
('María', 'Gómez', '35987654', 'LR35987654', '2022-07-01', '2027-07-01'),
('Carlos', 'Díaz', '28456789', 'LR28456789', '2018-01-10', '2028-01-10');

INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) VALUES
(1, 1, '2026-10-01', '2026-10-01', 'La Rioja', 'Chilecito', 190.50, NULL),
(1, 2, '2026-10-05', '2026-10-06', 'La Rioja', 'Córdoba', 460.00, 'Carga de repuestos'),
(2, 1, '2026-10-10', '2026-10-11', 'La Rioja', 'San Fernando del Valle de Catamarca', 155.00, NULL),
(3, 3, '2026-10-15', '2026-10-17', 'La Rioja', 'Buenos Aires', 1150.00, 'Viaje largo, dos días'),
(2, 2, '2026-11-02', '2026-11-02', 'Chilecito', 'La Rioja', 190.50, NULL);
