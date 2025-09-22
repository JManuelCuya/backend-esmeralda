use esmeralda_corp_bd;

insert into departamentos value(null,'Lima');
insert into provincia value(null,1,'Lima');
insert into distrito value(null,1,1,'Huachipa');
/*******************************************************/
/************INSERTANDO ESTADOS PEDIDOS*****************/
/*******************************************************/
insert into estado_atencion value(null,'Creado');
insert into estado_atencion value(null,'Proceso');
insert into estado_atencion value(null,'Gestion');
insert into estado_atencion value(null,'Finalizada');
/*******************************************************/
/************INSERTANDO EMPRESAS************************/
/*******************************************************/
insert into empresa value(null,'Esmeralda'),
(null,'Aliprofresco'),
(null,'Soraya'),
(null,'Viento Solar'),
(null,'Kallpa'),
(null,'San Fernando');
/*******************************************************/
/************INSERTANDO PARA AREA***********************/
/*******************************************************/
insert into area value(null,1,'Proyectos');
insert into area value(null,1,'Contabilidad'),
(null,1,'Finanzas'),
(null,1,'Recursos Hunanos'),
(null,1,'Cobranzas');
insert into area value(null,1,'Gerencia');
/*******************************************************/
/************INSERTANDO PARA EMPLEADO*******************/
/*******************************************************/
insert into empleado value(null,'Diego','Huatuco','Masgo','1980-11-05','Av. Delirios',1,'987456878','slacknaxhuatuco@gmail.com');
insert into empleado value(null,'Jose','Huaman','Saborio','1985-11-02','Av. Rupac',1,'987458743','empleado02@gmail.com');
insert into empleado value(null,'Helior','Vega','Geo','1995-07-05','Av. Felinos',1,'879654124','empleado03@gmail.com');
insert into empleado value(null,'Gustavo','Gaona','Fulful','1998-06-08','Av. Dubai',1,'987456321','empleado04@gmail.com');
insert into empleado value(null,'Yorleidis','Rondon','Hellbir','1992-05-12','Av. Ferro',1,'998563214','empleado025@gmail.com');
insert into empleado value(null,'Ramon','Dondon','Pavlidis','1992-05-12','Av. Ferro',1,'998563214','empleado026@gmail.com');
insert into empleado value(null,'Perico','Pasado','Vuelos','1992-05-12','Av. Ferro',1,'998563214','empleado026@gmail.com');
/*******************************************************/
/**INSERTANDO PARA ASIGNAR EMPLEADO AL CENTRO DE COSTOS*/
/*******************************************************/
insert into asignar_empleado value(null,1,1);
insert into asignar_empleado value(null,2,1);
insert into asignar_empleado value(null,3,2);
insert into asignar_empleado value(null,4,2);
insert into asignar_empleado value(null,5,3);
insert into asignar_empleado value(null,6,4);
insert into asignar_empleado value(null,7,4);
/*******************************************************/
/************INSERTANDO PARA USUARIOS*******************/
/*******************************************************/
insert into usuarios value(null,'huatuco','123456',1,1);
insert into usuarios value(null,'pavlidis','123',6,1);
insert into usuarios value(null,'periqueao','123',7,1);
/*******************************************************/
/************INSERTANDO PARA USUARIOS ROLES**************/
/*******************************************************/
insert into usuario_rol value(null,1,1);
insert into usuario_rol value(null,2,3);
insert into usuario_rol value(null,4,2);
/*******************************************************/
/************INSERTANDO PARA ROLES**********************/
/*******************************************************/
insert into roles value(null,'Administrador');
insert into roles value(null,'Solicitante');/*Usuario*/
insert into roles value(null,'Gestor');
insert into roles value(null,'Jefe de Area');
insert into roles value(null,'Analista');
insert into roles value(null,'Tecnico');
insert into roles value(null,'Gerencia');
/*******************************************************/
/************INSERTANDO PARA CENTRO DE COSTOS***********/
/*******************************************************/
insert into centro_costos value(null,'Cobranzas',1);
insert into centro_costos value(null,'Facturacion',1);
insert into centro_costos value(null,'Planeamiento',5);
insert into centro_costos value(null,'Gerencia',6);
/*******************************************************/
/************INSERTANDO PARA TIPO ATENCION**************/
/*******************************************************/
insert into tipo_atencion value (null,"Soporte"),
(null,"Requerimiento"),
(null,"Mantenimiento ");
/*******************************************************/
/************INSERTANDO PRIORIDAD***********************/
/*******************************************************/
insert into prioridad value(null,"Alta");
insert into prioridad value(null,"Media");
insert into prioridad value(null,"Baja");
/*******************************************************/
/************INSERTANDO CATEGORIAS DE ITEMS*************/
/*******************************************************/
insert into tb_categoria value(null,"Switches de red");
insert into tb_categoria value(null,"Routers");
insert into tb_categoria value(null,"Firewalls");
insert into tb_categoria value(null,"Access Points");
insert into tb_categoria value(null,"Servidores NAS");
insert into tb_categoria value(null,"Controladores SDN");
insert into tb_categoria value(null,"Herramientas de monitoreo");
insert into tb_categoria value(null,"Conectores y jacks");
insert into tb_categoria value(null,"Cables");
insert into tb_categoria value(null,"Patch Cords / Latiguillos");
insert into tb_categoria value(null,"Patch Panels");
insert into tb_categoria value(null,"Herramientas y testers");
insert into tb_categoria value(null,"Organizadores y racks");
insert into tb_categoria value(null,"Faceplates y accesorios");
/*PRODUCTOS CATEGORIA 1 Switches de red*/
insert into stock value (null,1,"TIC01200625","Cisco CBS350-8MGP-2X",10,350);
insert into stock value (null,1,"TIC01200625","TP-Link TL-SG3210XHP-M2",10,450);
insert into stock value (null,1,"TIC01200625","TRENDnet TPE-TG380",10,250);
insert into stock value (null,1,"TIC01200625","MikroTik CRS326-24G-2S+RM",10,300);
insert into stock value (null,1,"TIC01200625","Netgear GS308T",10,250);
/*PRODUCTOS CATEGORIA 2 Routers*/
insert into stock value (null,2,"TIC02200625","Ubiquiti EdgeRouter 4",10,280);
insert into stock value (null,2,"TIC02200625","MikroTik hEX S",10,150);
insert into stock value (null,2,"TIC02200625","Cisco RV260",10,170);
insert into stock value (null,2,"TIC02200625","TP-Link ER605",10,220);
insert into stock value (null,2,"TIC02200625","Asus RT-AX88U",10,250);
/*PRODUCTOS CATEGORIA 3 Firewalls*/
insert into stock value (null,3,"TIC03200625","Fortinet FortiGate 60F",10,220);
insert into stock value (null,3,"TIC03200625","Sophos XGS 87",10,170);
insert into stock value (null,3,"TIC03200625","Palo Alto PA-220",10,350);
insert into stock value (null,3,"TIC03200625","SonicWall TZ370",10,280);
insert into stock value (null,3,"TIC03200625","Cisco Firepower 1010",10,140);
/*PRODUCTOS CATEGORIA 4 Access Points (Wi-Fi)*/
insert into stock value (null,4,"TIC04200625","Ubiquiti UniFi 6 Lite",10,200);
insert into stock value (null,4,"TIC04200625","TP-Link EAP653",10,250);
insert into stock value (null,4,"TIC04200625","Aruba Instant On AP22",10,320);
insert into stock value (null,4,"TIC04200625","Cisco Business 240AC",10,180);
insert into stock value (null,4,"TIC04200625","Netgear WAX214",10,440);
/*PRODUCTOS CATEGORIA 5 Servidores NAS*/
insert into stock value (null,5,"TIC05200625","Synology DS920+",10,880);
insert into stock value (null,5,"TIC05200625","QNAP TS-464",8,790);
insert into stock value (null,5,"TIC05200625","TerraMaster F2-223",12,460);
insert into stock value (null,5,"TIC05200625","Asustor Lockerstor 2 Gen2",7,670);
insert into stock value (null,5,"TIC05200625","WD My Cloud EX2 Ultra",15,350);
/*PRODUCTOS CATEGORIA 6  Controladores SDNS*/
insert into stock value (null,6,"TIC06200625","OpenDaylight",5,0);
insert into stock value (null,6,"TIC06200625","ONOS",5,0);
insert into stock value (null,6,"TIC06200625","Ryu",5,0);
insert into stock value (null,6,"TIC06200625","Tungsten Fabric",5,0);
insert into stock value (null,6,"TIC06200625","Faucet",5,0);
/*PRODUCTOS CATEGORIA 7  Herramientas de monitoreo*/
insert into stock value (null,7,"TIC07200625","Zabbix",5,0);
insert into stock value (null,7,"TIC07200625","Nagios XI",4,320);
insert into stock value (null,7,"TIC07200625","PRTG Network Monitor",3,450);
insert into stock value (null,7,"TIC07200625","SolarWinds NPM",2,1200);
insert into stock value (null,7,"TIC07200625","LibreNMS",6,0);
/*PRODUCTOS CATEGORIA 8  Conectores y jacks*/
insert into stock value (null,8,"TIC08200625","Conector RJ45 Cat6 Keystone Jack",50,3.5);
insert into stock value (null,8,"TIC08200625","Conector RJ45 UTP Pass Through",40,2.8);
insert into stock value (null,8,"TIC08200625","Jack Keystone Cat6a Blindado",30,4.2);
insert into stock value (null,8,"TIC08200625","Patch Panel Cat6 24 Puertos",15,38);
insert into stock value (null,8,"TIC08200625","Plug RJ45 Toolless Cat6",45,3.9);
/*PRODUCTOS CATEGORIA 9  Cables*/
insert into stock value (null,9,"TIC09200625","Cable UTP Cat5e",100,0.6);
insert into stock value (null,9,"TIC09200625","Cable UTP Cat6",100,0.9);
insert into stock value (null,9,"TIC09200625","Cable UTP Cat6a",80,1.3);
insert into stock value (null,9,"TIC09200625","Cable FTP Cat6 Blindado",60,1.5);
insert into stock value (null,9,"TIC09200625","Cable de Consola Cisco (RJ45 a DB9)",25,7.5);
/*PRODUCTOS CATEGORIA 10  Patch Cords / Latiguillos*/
insert into stock value (null,10,"TIC10200625","Patch Cord UTP Cat6 1m",60,2.5);
insert into stock value (null,10,"TIC10200625","Patch Cord Cat6a Blindado",40,3.8);
insert into stock value (null,10,"TIC10200625","Patch Cord Slim Cat6",50,2.9);
insert into stock value (null,10,"TIC10200625","Patch Cord Colores (rojo, azul, amarillo)",90,2.2);
insert into stock value (null,10,"TIC10200625","Patch Cord de Fibra Óptica LC-LC OM3",20,12.0);
/*PRODUCTOS CATEGORIA 11  Patch Panels*/
insert into stock value (null,11,"TIC11200625","Patch Panel 24 Puertos Cat6",15,38);
insert into stock value (null,11,"TIC11200625","Patch Panel 48 Puertos Cat6a",10,65);
insert into stock value (null,11,"TIC11200625","Patch Panel Modular sin Herramienta",12,42);
insert into stock value (null,11,"TIC11200625","Mini Patch Panel 12 Puertos",8,22);
insert into stock value (null,11,"TIC11200625","Patch Panel Blindado FTP",10,55);
/*PRODUCTOS CATEGORIA 12  Herramientas y testers*/
insert into stock value (null,12,"TIC12200625","Crimpadora RJ45 / RJ11",20,14);
insert into stock value (null,12,"TIC12200625","Tester de red RJ45/RJ11",15,18);
insert into stock value (null,12,"TIC12200625","Pelacables UTP universal",30,6);
insert into stock value (null,12,"TIC12200625","Punch Down Tool (Impact Tool)",25,9);
insert into stock value (null,12,"TIC1200625","Probador de continuidad PoE",10,24);
/*PRODUCTOS CATEGORIA 13  Organizadores y racks	*/
insert into stock value (null,13,"TIC13200625","Rack mural 6U",6,180);
insert into stock value (null,13,"TIC13200625","Rack de piso 42U",3,620);
insert into stock value (null,13,"TIC13200625","Organizador de cables 1U",12,15);
insert into stock value (null,13,"TIC13200625","Bandeja ventilada 1U",10,18);
insert into stock value (null,13,"TIC13200625","Ventilador doble para rack",8,28);
/*PRODUCTOS CATEGORIA 14  Faceplates y accesorios*/
insert into stock value (null,14,"TIC14200625","Faceplate 1 puerto",50,1.5);
insert into stock value (null,14,"TIC14200625","Faceplate 2 puertos",50,1.8);
insert into stock value (null,14,"TIC14200625","Faceplate 4 puertos",40,2.2);
insert into stock value (null,14,"TIC14200625","Insertos modulares",100,0.9);
insert into stock value (null,14,"TIC14200625","Etiquetas para patch panel",200,0.3);




SELECT 
  e.id AS id_empleado,
  CONCAT(e.nombre, ' ', e.apellido_paterno, ' ', e.apellido_materno) AS nombre_completo,
  cc.descripcion AS centro_costos
FROM 
  asignar_empleado ae
JOIN 
  empleado e ON ae.id_empleado = e.id
JOIN 
  centro_costos cc ON ae.id_centro_costos = cc.id;
  
  
  SELECT cc2.id, cc2.descripcion
     FROM asignar_empleado ae
     JOIN centro_costos cc1 ON ae.id_centro_costos = cc1.id
     JOIN area a ON cc1.id_area = a.id
     JOIN centro_costos cc2 ON cc2.id_area = a.id
     WHERE ae.id_empleado = 6
