CREATE DATABASE IF NOT EXISTS jambeli_control CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jambeli_control;

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('administrador', 'docente', 'estudiante') NOT NULL DEFAULT 'estudiante',
  fotografia VARCHAR(255) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  ultimo_acceso DATETIME NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE horarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL DEFAULT 'Jornada regular',
  hora_entrada TIME NOT NULL,
  hora_salida TIME NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  configurado_por INT UNSIGNED NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_horario_usuario FOREIGN KEY (configurado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_horario_activo (activo)
) ENGINE=InnoDB;

CREATE TABLE cursos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  paralelo VARCHAR(10) NOT NULL,
  nivel VARCHAR(80) NOT NULL,
  periodo VARCHAR(20) NOT NULL,
  docente_id INT UNSIGNED NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY curso_periodo_unico (nombre, paralelo, periodo),
  CONSTRAINT fk_curso_docente FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE estudiantes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_qr CHAR(16) NOT NULL UNIQUE,
  identificacion VARCHAR(20) NOT NULL UNIQUE,
  nombres VARCHAR(80) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fotografia VARCHAR(255) NULL,
  curso_id INT UNSIGNED NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_estudiante_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE RESTRICT,
  INDEX idx_estudiante_nombre (apellidos, nombres)
) ENGINE=InnoDB;

CREATE TABLE asistencia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado ENUM('presente', 'tardanza', 'falta', 'justificada') NOT NULL DEFAULT 'presente',
  registrado_por INT UNSIGNED NULL,
  observacion VARCHAR(255) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_asistencia_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_asistencia_usuario FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  UNIQUE KEY asistencia_diaria (estudiante_id, fecha),
  INDEX idx_asistencia_fecha (fecha),
  INDEX idx_asistencia_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE reportes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  tipo ENUM('diario', 'semanal', 'mensual', 'estudiante', 'curso') NOT NULL,
  filtros JSON NULL,
  archivo VARCHAR(255) NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reporte_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador Jambelí', 'admin@jambeli.edu.ec', '$2y$10$REEMPLAZAR_CON_PASSWORD_HASH', 'administrador');

INSERT INTO horarios (nombre, hora_entrada, hora_salida, configurado_por)
SELECT 'Jornada regular', '07:30:00', '13:00:00', id FROM usuarios WHERE email = 'admin@jambeli.edu.ec' LIMIT 1;
