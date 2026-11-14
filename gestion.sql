-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: gestion
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_metrics`
--

DROP TABLE IF EXISTS `api_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `api_metrics` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `day` date NOT NULL,
  `route` varchar(160) NOT NULL,
  `method` varchar(10) NOT NULL,
  `status` smallint(5) unsigned NOT NULL,
  `requests` bigint(20) unsigned NOT NULL DEFAULT 0,
  `total_ms` double NOT NULL DEFAULT 0,
  `max_ms` double NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_metric_bucket` (`day`,`route`,`method`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_metrics`
--

LOCK TABLES `api_metrics` WRITE;
/*!40000 ALTER TABLE `api_metrics` DISABLE KEYS */;
INSERT INTO `api_metrics` VALUES (1,'2026-11-14','api/v1/configuracion','GET',200,1,128.41,128.41);
/*!40000 ALTER TABLE `api_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_events`
--

DROP TABLE IF EXISTS `audit_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(80) NOT NULL,
  `resource` varchar(40) NOT NULL,
  `resource_id` bigint(20) unsigned NOT NULL,
  `correlation_id` char(36) DEFAULT NULL,
  `properties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`properties`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `audit_events_actor_id_index` (`actor_id`),
  KEY `audit_events_correlation_id_index` (`correlation_id`),
  KEY `audit_events_created_at_index` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_events`
--

LOCK TABLES `audit_events` WRITE;
/*!40000 ALTER TABLE `audit_events` DISABLE KEYS */;
INSERT INTO `audit_events` VALUES (1,NULL,'docentes.updated','docentes',1,NULL,'[]','2026-11-14 21:46:16'),(2,NULL,'cursos.created','cursos',306,NULL,'{\"creditos\":3,\"periodo\":\"2026-2\",\"cupo_maximo\":30,\"cupo_disponible\":30,\"estado\":\"ABIERTO\"}','2026-11-14 21:46:19'),(3,NULL,'cursos.created','cursos',307,NULL,'{\"creditos\":4,\"periodo\":\"2026-2\",\"cupo_maximo\":25,\"cupo_disponible\":25,\"estado\":\"ABIERTO\"}','2026-11-14 21:46:19');
/*!40000 ALTER TABLE `audit_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba','i:1;',1794674903),('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer','i:1794674903;',1794674903),('laravel-cache-94d92f976fd06fd3e8cf53ec4e03d646','i:5;',1794674824),('laravel-cache-94d92f976fd06fd3e8cf53ec4e03d646:timer','i:1794674824;',1794674824),('laravel-cache-cursos:version','s:36:\"b16b9387-0697-438b-8b9a-78f274338954\";',2110034779);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cursos`
--

DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cursos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `creditos` tinyint(3) unsigned NOT NULL,
  `periodo` varchar(10) NOT NULL,
  `cupo_maximo` smallint(5) unsigned NOT NULL,
  `cupo_disponible` smallint(5) unsigned NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'ABIERTO',
  `docente_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cursos_codigo_unique` (`codigo`),
  KEY `cursos_docente_id_foreign` (`docente_id`),
  KEY `curso_oferta_filtro` (`periodo`,`estado`),
  CONSTRAINT `cursos_docente_id_foreign` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=308 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cursos`
--

LOCK TABLES `cursos` WRITE;
/*!40000 ALTER TABLE `cursos` DISABLE KEYS */;
INSERT INTO `cursos` VALUES (305,'ARQ-301','Arquitectura de Software',3,'2026-2',35,0,'ABIERTO',14,'2026-10-24 17:41:50','2026-10-24 22:43:04'),(306,'IS-101','Ingeniería de Software',3,'2026-2',30,30,'ABIERTO',1,'2026-11-14 21:46:19','2026-11-14 21:46:19'),(307,'BD-202','Bases de Datos Avanzadas',4,'2026-2',25,25,'ABIERTO',1,'2026-11-14 21:46:19','2026-11-14 21:46:19');
/*!40000 ALTER TABLE `cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docentes`
--

DROP TABLE IF EXISTS `docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `docentes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `documento` varchar(30) DEFAULT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `departamento` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `docentes_correo_unique` (`correo`),
  UNIQUE KEY `docentes_documento_unique` (`documento`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docentes`
--

LOCK TABLES `docentes` WRITE;
/*!40000 ALTER TABLE `docentes` DISABLE KEYS */;
INSERT INTO `docentes` VALUES (1,'1000000002','Carlos','Rojas','carlos.rojas@ut.edu.co','Ingeniería de Sistemas','2026-10-22 23:10:37','2026-11-14 21:46:16'),(14,NULL,'Carlos','Rojas','carlos.rojas14@ut.edu.co','Ingeniería de Sistemas','2026-10-24 17:49:45','2026-10-24 17:49:45');
/*!40000 ALTER TABLE `docentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes`
--

DROP TABLE IF EXISTS `estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estudiantes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `documento` varchar(255) NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `programa` varchar(255) NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'ACTIVO',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `estudiantes_documento_unique` (`documento`),
  UNIQUE KEY `estudiantes_correo_unique` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=1022 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes`
--

LOCK TABLES `estudiantes` WRITE;
/*!40000 ALTER TABLE `estudiantes` DISABLE KEYS */;
INSERT INTO `estudiantes` VALUES (1,'1000000001','Ana','Martínez','ana.martinez@ut.edu.co','Ingeniería de Sistemas','ACTIVO','2026-10-22 23:10:40','2026-10-22 23:10:40'),(2,'1792856293894','Luis','Pérez','est1792856293894@correo.edu.co','Ingeniería de Sistemas','ACTIVO','2026-10-24 20:38:14','2026-10-24 20:38:14'),(3,'1104545203','Laura Camila','Quintero Rojas','lcquinteror@ut.edu.co','Ingeniería de Sistemas','ACTIVO','2026-10-24 21:38:42','2026-10-24 21:38:42'),(1021,'1000001021','Ana','Martinez','ana.1021@ut.edu.co','Ingeniería de Sistemas','ACTIVO','2026-10-24 17:41:50','2026-10-24 17:41:50');
/*!40000 ALTER TABLE `estudiantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `identidades_externas`
--

DROP TABLE IF EXISTS `identidades_externas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `identidades_externas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `issuer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identidades_externas_issuer_subject_unique` (`issuer`,`subject`),
  KEY `identidades_externas_user_id_foreign` (`user_id`),
  CONSTRAINT `identidades_externas_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `identidades_externas`
--

LOCK TABLES `identidades_externas` WRITE;
/*!40000 ALTER TABLE `identidades_externas` DISABLE KEYS */;
/*!40000 ALTER TABLE `identidades_externas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `identity_flows`
--

DROP TABLE IF EXISTS `identity_flows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `identity_flows` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `state_hash` char(64) NOT NULL,
  `driver` varchar(20) NOT NULL,
  `nonce` varchar(64) NOT NULL,
  `challenge` varchar(43) NOT NULL,
  `code_hash` char(64) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identity_flows_state_hash_unique` (`state_hash`),
  KEY `identity_flows_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `identity_flows`
--

LOCK TABLES `identity_flows` WRITE;
/*!40000 ALTER TABLE `identity_flows` DISABLE KEYS */;
/*!40000 ALTER TABLE `identity_flows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matriculas`
--

DROP TABLE IF EXISTS `matriculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `matriculas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `estudiante_id` bigint(20) unsigned NOT NULL,
  `curso_id` bigint(20) unsigned NOT NULL,
  `periodo` varchar(10) NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'ACTIVA',
  `fecha_matricula` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `activa_unica` tinyint(3) unsigned GENERATED ALWAYS AS (case when `estado` = 'ACTIVA' then 1 else NULL end) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricula_activa_unique` (`estudiante_id`,`curso_id`,`periodo`,`activa_unica`),
  KEY `matriculas_estudiante_id_foreign` (`estudiante_id`),
  KEY `matriculas_curso_id_foreign` (`curso_id`),
  KEY `matricula_estudiante_filtro` (`estudiante_id`,`periodo`,`estado`),
  KEY `matricula_curso_filtro` (`curso_id`,`periodo`,`estado`),
  CONSTRAINT `matriculas_curso_id_foreign` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`),
  CONSTRAINT `matriculas_estudiante_id_foreign` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9002 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matriculas`
--

LOCK TABLES `matriculas` WRITE;
/*!40000 ALTER TABLE `matriculas` DISABLE KEYS */;
INSERT INTO `matriculas` VALUES (9001,1021,305,'2026-2','ACTIVA','2026-10-24 22:43:04','2026-10-24 22:43:04','2026-10-24 22:43:04',1);
/*!40000 ALTER TABLE `matriculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mercado_pago_receipts`
--

DROP TABLE IF EXISTS `mercado_pago_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mercado_pago_receipts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pago_id` bigint(20) unsigned NOT NULL,
  `provider_payment_id` varchar(80) NOT NULL,
  `status` varchar(40) NOT NULL,
  `provider_updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mercado_pago_receipts_provider_payment_id_unique` (`provider_payment_id`),
  KEY `mercado_pago_receipts_pago_id_foreign` (`pago_id`),
  CONSTRAINT `mercado_pago_receipts_pago_id_foreign` FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mercado_pago_receipts`
--

LOCK TABLES `mercado_pago_receipts` WRITE;
/*!40000 ALTER TABLE `mercado_pago_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `mercado_pago_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_10_22_044711_create_docentes_table',1),(5,'2026_10_22_044713_create_estudiantes_table',1),(6,'2026_10_22_044715_create_cursos_table',1),(7,'2026_10_22_044758_create_matriculas_table',1),(8,'2026_10_22_061918_add_rol_to_users_table',2),(9,'2026_11_10_000001_add_integrador_payments_and_constraints',3),(10,'2026_11_10_000002_create_external_identity_tables',3),(11,'2026_11_10_000003_create_observability_tables',3),(12,'2026_11_10_000004_create_notification_outbox',3),(13,'2026_11_10_000005_use_case_sensitive_external_identifiers',3),(14,'2026_11_13_000001_add_mercado_pago_checkout',3),(15,'2026_11_14_000001_add_documento_to_docentes_table',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notificaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `event_key` varchar(100) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `tipo` varchar(60) NOT NULL,
  `resource_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `notificaciones_event_key_unique` (`event_key`),
  KEY `notificaciones_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_outbox`
--

DROP TABLE IF EXISTS `notification_outbox`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_outbox` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `event_key` varchar(100) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `tipo` varchar(60) NOT NULL,
  `resource_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dispatched_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_outbox_event_key_unique` (`event_key`),
  KEY `notification_outbox_delivered_at_index` (`delivered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_outbox`
--

LOCK TABLES `notification_outbox` WRITE;
/*!40000 ALTER TABLE `notification_outbox` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_outbox` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago_transacciones`
--

DROP TABLE IF EXISTS `pago_transacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pago_transacciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pago_id` bigint(20) unsigned NOT NULL,
  `actor_id` bigint(20) unsigned NOT NULL,
  `idempotency_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `solicitud_hash` char(64) NOT NULL,
  `accion` varchar(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `referencia` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pago_transaccion_idempotencia` (`actor_id`,`idempotency_key`),
  KEY `pago_transacciones_pago_id_foreign` (`pago_id`),
  CONSTRAINT `pago_transacciones_pago_id_foreign` FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago_transacciones`
--

LOCK TABLES `pago_transacciones` WRITE;
/*!40000 ALTER TABLE `pago_transacciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago_transacciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `matricula_id` bigint(20) unsigned NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `moneda` char(3) NOT NULL DEFAULT 'COP',
  `estado` varchar(20) NOT NULL DEFAULT 'PENDIENTE',
  `proveedor` varchar(30) NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `procesado_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `mp_external_reference` char(36) DEFAULT NULL,
  `mp_preference_id` varchar(255) DEFAULT NULL,
  `mp_checkout_url` text DEFAULT NULL,
  `mp_checkout_requested_at` timestamp NULL DEFAULT NULL,
  `requiere_revision` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pagos_matricula_id_unique` (`matricula_id`),
  UNIQUE KEY `pagos_referencia_unique` (`referencia`),
  UNIQUE KEY `pagos_mp_external_reference_unique` (`mp_external_reference`),
  KEY `pagos_estado_index` (`estado`),
  CONSTRAINT `pagos_matricula_id_foreign` FOREIGN KEY (`matricula_id`) REFERENCES `matriculas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('XrsftdeXMsUr9DZfpfVMBhSz9UqGymB4em4xw6kf',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMjBaT20yeVpkaVlINTlqMGZDQTJhY0ZxdUFvMmVZZlNsWXVVc21uYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1792859762);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `rol` varchar(255) NOT NULL DEFAULT 'ESTUDIANTE',
  `estudiante_id` bigint(20) unsigned DEFAULT NULL,
  `docente_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1022 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrador','admin@ut.edu.co',NULL,'$2y$12$cw.u7qajAHlYHlqRgFRlv.3ZDvCLkjb2jtNoXVjO/zviN5Ngq9a7.',NULL,'2026-10-22 23:10:36','2026-11-14 21:46:17','ADMIN',NULL,NULL),(2,'Carlos Rojas','carlos.rojas@ut.edu.co',NULL,'$2y$12$HEyfBdkgLGp/wedNufJ5O.fp/QLtwP5BKQA4mig32oDywYOiK8kyq',NULL,'2026-10-22 23:10:37','2026-11-14 21:46:18','DOCENTE',NULL,1),(3,'Ana Martínez','ana.martinez@ut.edu.co',NULL,'$2y$12$bICMSK7eTH1y3SRHjZ63TOjHF01xNFB4zfcQEIMzqV.1UIhE6O3Yq',NULL,'2026-10-22 23:10:40','2026-11-14 21:46:19','ESTUDIANTE',1,NULL),(1021,'Ana Martinez','estudiante1021@ut.edu.co',NULL,'$2y$12$ZoVR3z3vGmMQlatWpfR5cuHA4T.av6Owknz2OqzE4mguHnnkav.ZS',NULL,'2026-10-24 17:56:26','2026-10-24 17:56:26','ESTUDIANTE',1021,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-14 11:48:19
