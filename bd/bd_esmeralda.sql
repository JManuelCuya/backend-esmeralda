
create database esmeralda_corp_bd;
use esmeralda_corp_bd;

drop database  esmeralda_corp_bd;
/*use sf_sap;*/
create table tb_categoria(
id int auto_increment primary key,
descripcion varchar(120)
);

CREATE TABLE stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria int not null,
  codigo_producto VARCHAR(20),
  descripcion VARCHAR(100),
  cantidad INT,
  precio_actual DECIMAL(10,2),
  foreign key (id_categoria) references tb_categoria(id)
);

CREATE TABLE revalorizacion_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_stock INT,
  precio_anterior DECIMAL(10,2),
  precio_nuevo DECIMAL(10,2),
  motivo TEXT,
  fecha_revalorizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  usuario VARCHAR(50),
  FOREIGN KEY (id_stock) REFERENCES stock(id)
);


CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

create table empleado (
id int auto_increment primary key,
nombre varchar(100) not null,
apellido_paterno varchar(50) not null,
apellido_materno varchar(50) not null,
fecha_nac datetime not null,
direccion varchar(50),
id_distrito int,
telefono varchar(10),
email varchar(50),
FOREIGN KEY (id_distrito) REFERENCES distrito(id)
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  empleado_id INT,
  estado BOOLEAN DEFAULT 1,
  FOREIGN KEY (empleado_id) REFERENCES empleado(id)
);

CREATE TABLE usuario_rol (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  rol_id INT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

create table empresa(
  id INT AUTO_INCREMENT PRIMARY KEY,
  descripcion VARCHAR(80) NOT NULL
);

create table area (
id int auto_increment primary key,
id_empresa int,
descripcion varchar(80) not null,
FOREIGN KEY (id_empresa) REFERENCES empresa(id)
);

CREATE TABLE centro_costos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descripcion VARCHAR(80) NOT NULL,
  id_area INT,
  FOREIGN KEY (id_area) REFERENCES area(id)
);


CREATE TABLE asignar_empleado (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_empleado INT NOT NULL,
  id_centro_costos INT NOT NULL,
  FOREIGN KEY (id_empleado) REFERENCES empleado(id),
  FOREIGN KEY (id_centro_costos) REFERENCES centro_costos(id)
);

create table tipo_atencion(
id INT auto_increment PRIMARY KEY,
descripcion VARCHAR(80) NOT NULL
);

CREATE TABLE prioridad(
id INT auto_increment PRIMARY KEY,
descripcion VARCHAR(80) NOT NULL
);

create table estado_atencion(
id INT auto_increment PRIMARY KEY,
descripcion VARCHAR(80) NOT NULL
);

CREATE TABLE atencion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_tipo_atencion INT,/*FRONT*/
  id_empleado INT,/*lo extraigo de la sesion*/
  id_centro_costos INT, /*FRONT*/
  fecha_atencion DATE,  /*carga automatica*/
  fecha_atencion_fin DATE,  /*carga automatica*/
  hora_inicio TIME NOT NULL,      -- nueva columna
  hora_fin TIME NOT NULL,         -- nueva columna
  motivo varchar(100) not null/*FRONT*/,
  observacion varchar(200)  null/*FRONT*/,
  id_prioridad int not null,
	FOREIGN KEY (id_tipo_atencion) REFERENCES tipo_atencion(id),
	FOREIGN KEY (id_empleado) REFERENCES empleado(id),
	FOREIGN KEY (id_centro_costos) REFERENCES centro_costos(id)
);

ALTER TABLE atencion ADD fecha_ultima_actualizacion DATETIME;


CREATE TABLE atencion_costeo_hist (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_atencion      INT NOT NULL,
  -- Identificación del modelo (opcional pero útil para auditoría)
  modelo_id        VARCHAR(50)  NULL,
  modelo_version   VARCHAR(50)  NULL,
  -- Valores de comparación
  costo_predicho   DECIMAL(10,2) NOT NULL,
  costo_real       DECIMAL(10,2) NULL,
  -- Métricas (columnas generadas para evitar recalcular)
  error_abs        DECIMAL(10,2) AS (
                      IF(costo_real IS NULL, NULL, ABS(costo_real - costo_predicho))
                    ) STORED,
  error_pct        DECIMAL(8,5)  AS (
                      IF(costo_real IS NULL OR costo_predicho = 0,
                         NULL, (costo_real - costo_predicho) / costo_predicho)
                    ) STORED,
  -- Recomendación y aplicación de ajuste
  accion_recom     ENUM('SUBIR_COBRO','BAJAR_COBRO','SIN_CAMBIO') NULL,
  costo_ajustado   DECIMAL(10,2) NULL,
  aplicado         TINYINT(1) DEFAULT 0,     -- 1 si el ajuste se aplicó
  -- Quién hizo la acción / marcas de tiempo
  usuario_id       INT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  applied_at       DATETIME NULL,

  CONSTRAINT fk_costeo_atencion
    FOREIGN KEY (id_atencion) REFERENCES atencion(id)
) ENGINE=InnoDB;

-- Índices para rendimiento
CREATE INDEX idx_costeo_atencion_created ON atencion_costeo_hist (id_atencion, created_at);
CREATE INDEX idx_costeo_created           ON atencion_costeo_hist (created_at);
CREATE INDEX idx_costeo_aplicado          ON atencion_costeo_hist (aplicado);

ALTER TABLE atencion_costeo_hist
  ADD COLUMN error_rel DECIMAL(10,4) NULL AFTER error_abs;
ALTER TABLE atencion_costeo_hist
  ADD COLUMN fuente_prediccion ENUM('ml','regla','manual') 
  NOT NULL DEFAULT 'ml' AFTER modelo_version;

SHOW COLUMNS FROM atencion_costeo_hist;
ALTER TABLE atencion_costeo_hist
  MODIFY id BIGINT NOT NULL AUTO_INCREMENT,
  MODIFY id_atencion INT NOT NULL,
  MODIFY usuario_id INT NULL;


CREATE TABLE notificaciones (
id INT AUTO_INCREMENT PRIMARY KEY,
id_empleado INT,
mensaje TEXT,
leido BOOLEAN DEFAULT FALSE,
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
estado ENUM('pendiente', 'leída') DEFAULT 'pendiente',
FOREIGN KEY (id_empleado) REFERENCES empleado(id)
);


ALTER TABLE atencion
  ADD costo_real     DECIMAL(10,2) NULL,
  ADD error_abs      DECIMAL(10,2) NULL,
  ADD error_pct      DECIMAL(8,5)  NULL,
  ADD accion_recom   ENUM('SUBIR_COBRO','BAJAR_COBRO','SIN_CAMBIO') NULL,
  ADD costo_ajustado DECIMAL(10,2) NULL,
  ADD estado_costeo  ENUM('PENDIENTE','COMPARADO','AJUSTADO') DEFAULT 'PENDIENTE';

/*VA DESPUES DE LOS ALTER Y CREACION*/
ALTER TABLE atencion
ADD costo_estimado DECIMAL(10, 2) NULL;
ALTER TABLE atencion
ADD estado varchar(50);
ALTER TABLE atencion
ADD COLUMN fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP;

/*PARECE QUE YA ESTA CREADO*/
ALTER TABLE atencion
ADD COLUMN id_prioridad INT,
ADD CONSTRAINT fk_atencion_prioridad
  FOREIGN KEY (id_prioridad)
  REFERENCES prioridad(id);


ALTER TABLE atencion
ADD COLUMN id_estado INT,
ADD CONSTRAINT fk_atencion_estado
  FOREIGN KEY (id_estado)
  REFERENCES estado_atencion(id)
  
  
  