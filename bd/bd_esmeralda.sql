
create database esmeralda_corp_bd;
use esmeralda_corp_bd;

drop database  esmeralda_corp_bd;

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
ADD costo_estimado DECIMAL(10, 2) NULL;
ALTER TABLE atencion
ADD estado varchar(50);
ALTER TABLE atencion
ADD COLUMN fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP;

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
  
  
  