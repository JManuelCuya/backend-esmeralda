create table departamentos(
id int auto_increment primary key,
descripcion varchar(150) not null
);

create table provincia(
id int auto_increment primary key,
id_departamento int,
descripcion varchar(50) not null,
FOREIGN KEY (id_departamento) REFERENCES departamentos(id)
);

create table distrito(
id int auto_increment primary key,
id_departamento int,
id_provincia int,
descripcion varchar(50) not null,
FOREIGN KEY (id_departamento) REFERENCES departamentos(id),
FOREIGN KEY (id_provincia) REFERENCES provincia(id)
);