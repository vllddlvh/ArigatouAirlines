-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: arigatouAirlines
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aircraft`
--

DROP TABLE IF EXISTS `aircraft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aircraft` (
  `aircraft_id` int NOT NULL AUTO_INCREMENT,
  `airline_id` int NOT NULL,
  `aircraft_type_id` int NOT NULL,
  `registration_number` varchar(20) NOT NULL,
  `status` enum('Active','Maintenance','Retired') DEFAULT 'Active',
  PRIMARY KEY (`aircraft_id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `airline_id` (`airline_id`),
  KEY `aircraft_type_id` (`aircraft_type_id`),
  CONSTRAINT `aircraft_ibfk_1` FOREIGN KEY (`airline_id`) REFERENCES `airline` (`airline_id`),
  CONSTRAINT `aircraft_ibfk_2` FOREIGN KEY (`aircraft_type_id`) REFERENCES `aircraft_type` (`aircraft_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aircraft`
--

LOCK TABLES `aircraft` WRITE;
/*!40000 ALTER TABLE `aircraft` DISABLE KEYS */;
INSERT INTO `aircraft` VALUES (1,4,2,'0506','Active'),(4,20,2,'2005','Active'),(5,10,2,'1777','Active'),(6,10,2,'1997','Active'),(7,10,2,'1998','Active'),(8,9,2,'1999','Active');
/*!40000 ALTER TABLE `aircraft` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aircraft_type`
--

DROP TABLE IF EXISTS `aircraft_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aircraft_type` (
  `aircraft_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `total_seats` int NOT NULL,
  `num_cols` int NOT NULL DEFAULT '6',
  PRIMARY KEY (`aircraft_type_id`),
  CONSTRAINT `aircraft_type_chk_1` CHECK ((`total_seats` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aircraft_type`
--

LOCK TABLES `aircraft_type` WRITE;
/*!40000 ALTER TABLE `aircraft_type` DISABLE KEYS */;
INSERT INTO `aircraft_type` VALUES (2,'Airbus 340',300,6),(3,'Boing 787',240,8),(6,'Boing 2005',240,6),(8,'Boing 5000',240,6);
/*!40000 ALTER TABLE `aircraft_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `airline`
--

DROP TABLE IF EXISTS `airline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airline` (
  `airline_id` int NOT NULL AUTO_INCREMENT,
  `airline_code` varchar(10) NOT NULL,
  `airline_name` varchar(100) NOT NULL,
  `country` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`airline_id`),
  UNIQUE KEY `airline_code` (`airline_code`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airline`
--

LOCK TABLES `airline` WRITE;
/*!40000 ALTER TABLE `airline` DISABLE KEYS */;
INSERT INTO `airline` VALUES (2,'VJ1','Vietjet','Viet Nam',0),(3,'VJ2','Vietjet','Viet Nam',0),(4,'VJ142','Vietjet','Viet Nam',0),(5,'VJ1421','Vietjet','Viet Nam',0),(6,'VJ14211','Vietjet','Viet Nam',0),(7,'T','Vietjet','Viet Nam',0),(8,'Ty','Vietjet','Viet Nam',0),(9,'TestCreate','Vietjet','Viet Nam',0),(10,'Ter','Vietjet','Viet Nam',0),(11,'HUHU','Vietjet','Viet Nam',0),(12,'DB','ADDD','VIETNAME',1),(18,'D22','ADDD','VIETNAME',9),(19,'DaoLe','Vietjet','Viet Nam',0),(20,'DaoLe1','Vietjet','Viet Nam',1),(21,'mapstruct','Vietjet','Viet Nam',1),(22,'mapstruct1','Vietjet','Viet Nam',1),(23,'builders','Vietjet','Viet Nam',0),(24,'builders1','Vietjet','Viet Nam',0),(25,'build','Vietjet','Viet Nam',0),(26,'build12','Vietjet','Viet Nam',1),(27,'build123','Vietjet','Viet Nam',0);
/*!40000 ALTER TABLE `airline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `airport`
--

DROP TABLE IF EXISTS `airport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airport` (
  `airport_id` int NOT NULL AUTO_INCREMENT,
  `airport_code` varchar(10) NOT NULL,
  `airport_name` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  PRIMARY KEY (`airport_id`),
  UNIQUE KEY `airport_code` (`airport_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airport`
--

LOCK TABLES `airport` WRITE;
/*!40000 ALTER TABLE `airport` DISABLE KEYS */;
INSERT INTO `airport` VALUES (1,'VN','NOI BAI','HA NOI','VIET NAM'),(3,'HN','MY DINH','HA NOI','VIET NAM'),(5,'HN4','MY DINH','HA NOI YEU','VIET NAM'),(6,'HN5','MY DINH','HA NOI YEU','VIET NAM'),(7,'HN10','MY DINH','HA NOI YEU','VIET NAM');
/*!40000 ALTER TABLE `airport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ancillary_service`
--

DROP TABLE IF EXISTS `ancillary_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ancillary_service` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `service_name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ancillary_service`
--

LOCK TABLES `ancillary_service` WRITE;
/*!40000 ALTER TABLE `ancillary_service` DISABLE KEYS */;
/*!40000 ALTER TABLE `ancillary_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` varchar(100) DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `booking_code` varchar(20) NOT NULL,
  `booking_status` enum('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  `payment_status` enum('Pending','Paid','Refunded','Failed') DEFAULT 'Pending',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_deadline` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `idx_booking_user` (`user_id`,`created_at`),
  CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_service`
--

DROP TABLE IF EXISTS `booking_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_service` (
  `ticket_id` int NOT NULL,
  `service_id` int NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ticket_id`,`service_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `booking_service_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`ticket_id`) ON DELETE CASCADE,
  CONSTRAINT `booking_service_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `ancillary_service` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_service`
--

LOCK TABLES `booking_service` WRITE;
/*!40000 ALTER TABLE `booking_service` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight`
--

DROP TABLE IF EXISTS `flight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight` (
  `flight_id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `aircraft_id` int DEFAULT NULL,
  `flight_date` date NOT NULL,
  `departure_datetime` datetime NOT NULL,
  `arrival_datetime` datetime NOT NULL,
  `status` enum('Scheduled','On Time','Delayed','Cancelled','Departed','Arrived') DEFAULT 'Scheduled',
  PRIMARY KEY (`flight_id`),
  UNIQUE KEY `schedule_id` (`schedule_id`,`flight_date`),
  KEY `aircraft_id` (`aircraft_id`),
  KEY `idx_flight_search` (`flight_date`,`status`),
  CONSTRAINT `flight_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `flight_schedule` (`schedule_id`),
  CONSTRAINT `flight_ibfk_2` FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft` (`aircraft_id`),
  CONSTRAINT `flight_chk_1` CHECK ((`arrival_datetime` > `departure_datetime`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight`
--

LOCK TABLES `flight` WRITE;
/*!40000 ALTER TABLE `flight` DISABLE KEYS */;
/*!40000 ALTER TABLE `flight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight_price`
--

DROP TABLE IF EXISTS `flight_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_price` (
  `price_id` int NOT NULL AUTO_INCREMENT,
  `flight_id` int NOT NULL,
  `class_id` int NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT '0.00',
  `total_seats` int NOT NULL,
  `available_seats` int NOT NULL,
  PRIMARY KEY (`price_id`),
  UNIQUE KEY `flight_id` (`flight_id`,`class_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `flight_price_ibfk_1` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`flight_id`) ON DELETE CASCADE,
  CONSTRAINT `flight_price_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `ticket_class` (`class_id`),
  CONSTRAINT `flight_price_chk_1` CHECK ((`base_price` >= 0)),
  CONSTRAINT `flight_price_chk_2` CHECK ((`tax` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight_price`
--

LOCK TABLES `flight_price` WRITE;
/*!40000 ALTER TABLE `flight_price` DISABLE KEYS */;
/*!40000 ALTER TABLE `flight_price` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight_schedule`
--

DROP TABLE IF EXISTS `flight_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `flight_number` varchar(20) NOT NULL,
  `airline_id` int NOT NULL,
  `departure_airport_id` int NOT NULL,
  `arrival_airport_id` int NOT NULL,
  `departure_time` time NOT NULL,
  `arrival_time` time NOT NULL,
  `duration_minutes` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`schedule_id`),
  UNIQUE KEY `flight_number` (`flight_number`,`departure_airport_id`,`arrival_airport_id`),
  KEY `airline_id` (`airline_id`),
  KEY `arrival_airport_id` (`arrival_airport_id`),
  KEY `idx_schedule_search` (`departure_airport_id`,`arrival_airport_id`,`is_active`),
  CONSTRAINT `flight_schedule_ibfk_1` FOREIGN KEY (`airline_id`) REFERENCES `airline` (`airline_id`),
  CONSTRAINT `flight_schedule_ibfk_2` FOREIGN KEY (`departure_airport_id`) REFERENCES `airport` (`airport_id`),
  CONSTRAINT `flight_schedule_ibfk_3` FOREIGN KEY (`arrival_airport_id`) REFERENCES `airport` (`airport_id`),
  CONSTRAINT `flight_schedule_chk_1` CHECK ((`departure_airport_id` <> `arrival_airport_id`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight_schedule`
--

LOCK TABLES `flight_schedule` WRITE;
/*!40000 ALTER TABLE `flight_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `flight_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight_seat`
--

DROP TABLE IF EXISTS `flight_seat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_seat` (
  `flight_seat_id` int NOT NULL AUTO_INCREMENT,
  `flight_id` int NOT NULL,
  `seat_map_id` int NOT NULL,
  `status` enum('Available','Booked','Locked') DEFAULT 'Available',
  PRIMARY KEY (`flight_seat_id`),
  UNIQUE KEY `flight_id` (`flight_id`,`seat_map_id`),
  KEY `seat_map_id` (`seat_map_id`),
  CONSTRAINT `flight_seat_ibfk_1` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`flight_id`) ON DELETE CASCADE,
  CONSTRAINT `flight_seat_ibfk_2` FOREIGN KEY (`seat_map_id`) REFERENCES `seat_map` (`seat_map_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight_seat`
--

LOCK TABLES `flight_seat` WRITE;
/*!40000 ALTER TABLE `flight_seat` DISABLE KEYS */;
/*!40000 ALTER TABLE `flight_seat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invalidated_token`
--

DROP TABLE IF EXISTS `invalidated_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invalidated_token` (
  `id` varchar(255) NOT NULL,
  `expiry_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invalidated_token`
--

LOCK TABLES `invalidated_token` WRITE;
/*!40000 ALTER TABLE `invalidated_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `invalidated_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passenger`
--

DROP TABLE IF EXISTS `passenger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passenger` (
  `passenger_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `passport_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`passenger_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `passenger_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passenger`
--

LOCK TABLES `passenger` WRITE;
/*!40000 ALTER TABLE `passenger` DISABLE KEYS */;
/*!40000 ALTER TABLE `passenger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_otp`
--

DROP TABLE IF EXISTS `password_otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_otp` (
  `otp` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  `is_valid` tinyint NOT NULL DEFAULT '1',
  `expiry_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`otp`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_otp_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_otp`
--

LOCK TABLES `password_otp` WRITE;
/*!40000 ALTER TABLE `password_otp` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_status` enum('Success','Failed','Pending') DEFAULT 'Pending',
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `permission_name` varchar(100) NOT NULL,
  `resource` varchar(50) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`permission_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_name` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('ADMIN','Admin role'),('USER','User role');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `role_name` varchar(50) NOT NULL,
  `permission_name` varchar(100) NOT NULL,
  PRIMARY KEY (`role_name`,`permission_name`),
  KEY `permission_name` (`permission_name`),
  CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`role_name`) REFERENCES `role` (`role_name`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permission_name`) REFERENCES `permission` (`permission_name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seat_map`
--

DROP TABLE IF EXISTS `seat_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seat_map` (
  `seat_map_id` int NOT NULL AUTO_INCREMENT,
  `aircraft_type_id` int NOT NULL,
  `seat_number` varchar(10) NOT NULL,
  `seat_class` enum('ECONOMY','BUSINESS_PREMIER','PREMIUM_ECONOMY') NOT NULL,
  `seat_type` enum('WINDOW','AISLE','MIDDLE','EXIT_ROW') DEFAULT NULL,
  `visual_row` int DEFAULT NULL,
  `visual_col` int DEFAULT NULL,
  PRIMARY KEY (`seat_map_id`),
  UNIQUE KEY `aircraft_type_id` (`aircraft_type_id`,`seat_number`),
  CONSTRAINT `seat_map_ibfk_1` FOREIGN KEY (`aircraft_type_id`) REFERENCES `aircraft_type` (`aircraft_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=728 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat_map`
--

LOCK TABLES `seat_map` WRITE;
/*!40000 ALTER TABLE `seat_map` DISABLE KEYS */;
INSERT INTO `seat_map` VALUES (1,2,'1A','ECONOMY','WINDOW',NULL,NULL),(2,2,'2A','ECONOMY','WINDOW',NULL,NULL),(4,2,'3A','ECONOMY','WINDOW',NULL,NULL),(7,2,'4A','ECONOMY','WINDOW',2,3),(488,8,'1A','BUSINESS_PREMIER','WINDOW',1,1),(489,8,'1B','BUSINESS_PREMIER','MIDDLE',1,2),(490,8,'1C','BUSINESS_PREMIER','AISLE',1,3),(491,8,'1D','BUSINESS_PREMIER','MIDDLE',1,4),(492,8,'1E','BUSINESS_PREMIER','MIDDLE',1,5),(493,8,'1F','BUSINESS_PREMIER','WINDOW',1,6),(494,8,'2A','BUSINESS_PREMIER','WINDOW',2,1),(495,8,'2B','BUSINESS_PREMIER','MIDDLE',2,2),(496,8,'2C','BUSINESS_PREMIER','AISLE',2,3),(497,8,'2D','BUSINESS_PREMIER','MIDDLE',2,4),(498,8,'2E','BUSINESS_PREMIER','MIDDLE',2,5),(499,8,'2F','BUSINESS_PREMIER','WINDOW',2,6),(500,8,'3A','BUSINESS_PREMIER','WINDOW',3,1),(501,8,'3B','BUSINESS_PREMIER','MIDDLE',3,2),(502,8,'3C','BUSINESS_PREMIER','AISLE',3,3),(503,8,'3D','BUSINESS_PREMIER','MIDDLE',3,4),(504,8,'3E','BUSINESS_PREMIER','MIDDLE',3,5),(505,8,'3F','BUSINESS_PREMIER','WINDOW',3,6),(506,8,'4A','BUSINESS_PREMIER','WINDOW',4,1),(507,8,'4B','BUSINESS_PREMIER','MIDDLE',4,2),(508,8,'4C','BUSINESS_PREMIER','AISLE',4,3),(509,8,'4D','BUSINESS_PREMIER','MIDDLE',4,4),(510,8,'4E','BUSINESS_PREMIER','MIDDLE',4,5),(511,8,'4F','BUSINESS_PREMIER','WINDOW',4,6),(512,8,'5A','BUSINESS_PREMIER','WINDOW',5,1),(513,8,'5B','BUSINESS_PREMIER','MIDDLE',5,2),(514,8,'5C','BUSINESS_PREMIER','AISLE',5,3),(515,8,'5D','BUSINESS_PREMIER','MIDDLE',5,4),(516,8,'5E','BUSINESS_PREMIER','MIDDLE',5,5),(517,8,'5F','BUSINESS_PREMIER','WINDOW',5,6),(518,8,'6A','BUSINESS_PREMIER','WINDOW',6,1),(519,8,'6B','BUSINESS_PREMIER','MIDDLE',6,2),(520,8,'6C','BUSINESS_PREMIER','AISLE',6,3),(521,8,'6D','BUSINESS_PREMIER','MIDDLE',6,4),(522,8,'6E','BUSINESS_PREMIER','MIDDLE',6,5),(523,8,'6F','BUSINESS_PREMIER','WINDOW',6,6),(524,8,'7A','BUSINESS_PREMIER','WINDOW',7,1),(525,8,'7B','BUSINESS_PREMIER','MIDDLE',7,2),(526,8,'7C','BUSINESS_PREMIER','AISLE',7,3),(527,8,'7D','BUSINESS_PREMIER','MIDDLE',7,4),(528,8,'7E','BUSINESS_PREMIER','MIDDLE',7,5),(529,8,'7F','BUSINESS_PREMIER','WINDOW',7,6),(530,8,'8A','BUSINESS_PREMIER','WINDOW',8,1),(531,8,'8B','BUSINESS_PREMIER','MIDDLE',8,2),(532,8,'8C','BUSINESS_PREMIER','AISLE',8,3),(533,8,'8D','BUSINESS_PREMIER','MIDDLE',8,4),(534,8,'8E','BUSINESS_PREMIER','MIDDLE',8,5),(535,8,'8F','BUSINESS_PREMIER','WINDOW',8,6),(536,8,'9A','BUSINESS_PREMIER','WINDOW',9,1),(537,8,'9B','BUSINESS_PREMIER','MIDDLE',9,2),(538,8,'9C','BUSINESS_PREMIER','AISLE',9,3),(539,8,'9D','BUSINESS_PREMIER','MIDDLE',9,4),(540,8,'9E','BUSINESS_PREMIER','MIDDLE',9,5),(541,8,'9F','BUSINESS_PREMIER','WINDOW',9,6),(542,8,'10A','BUSINESS_PREMIER','WINDOW',10,1),(543,8,'10B','BUSINESS_PREMIER','MIDDLE',10,2),(544,8,'10C','BUSINESS_PREMIER','AISLE',10,3),(545,8,'10D','BUSINESS_PREMIER','MIDDLE',10,4),(546,8,'10E','BUSINESS_PREMIER','MIDDLE',10,5),(547,8,'10F','BUSINESS_PREMIER','WINDOW',10,6),(548,8,'11A','BUSINESS_PREMIER','WINDOW',11,1),(549,8,'11B','BUSINESS_PREMIER','MIDDLE',11,2),(550,8,'11C','BUSINESS_PREMIER','AISLE',11,3),(551,8,'11D','BUSINESS_PREMIER','MIDDLE',11,4),(552,8,'11E','BUSINESS_PREMIER','MIDDLE',11,5),(553,8,'11F','BUSINESS_PREMIER','WINDOW',11,6),(554,8,'12A','BUSINESS_PREMIER','WINDOW',12,1),(555,8,'12B','BUSINESS_PREMIER','MIDDLE',12,2),(556,8,'12C','BUSINESS_PREMIER','AISLE',12,3),(557,8,'12D','BUSINESS_PREMIER','MIDDLE',12,4),(558,8,'12E','BUSINESS_PREMIER','MIDDLE',12,5),(559,8,'12F','BUSINESS_PREMIER','WINDOW',12,6),(560,8,'13A','BUSINESS_PREMIER','WINDOW',13,1),(561,8,'13B','BUSINESS_PREMIER','MIDDLE',13,2),(562,8,'13C','BUSINESS_PREMIER','AISLE',13,3),(563,8,'13D','BUSINESS_PREMIER','MIDDLE',13,4),(564,8,'13E','BUSINESS_PREMIER','MIDDLE',13,5),(565,8,'13F','BUSINESS_PREMIER','WINDOW',13,6),(566,8,'14A','PREMIUM_ECONOMY','WINDOW',14,1),(567,8,'14B','PREMIUM_ECONOMY','MIDDLE',14,2),(568,8,'14C','PREMIUM_ECONOMY','AISLE',14,3),(569,8,'14D','PREMIUM_ECONOMY','MIDDLE',14,4),(570,8,'14E','PREMIUM_ECONOMY','MIDDLE',14,5),(571,8,'14F','PREMIUM_ECONOMY','WINDOW',14,6),(572,8,'15A','PREMIUM_ECONOMY','WINDOW',15,1),(573,8,'15B','PREMIUM_ECONOMY','MIDDLE',15,2),(574,8,'15C','PREMIUM_ECONOMY','AISLE',15,3),(575,8,'15D','PREMIUM_ECONOMY','MIDDLE',15,4),(576,8,'15E','PREMIUM_ECONOMY','MIDDLE',15,5),(577,8,'15F','PREMIUM_ECONOMY','WINDOW',15,6),(578,8,'16A','PREMIUM_ECONOMY','WINDOW',16,1),(579,8,'16B','PREMIUM_ECONOMY','MIDDLE',16,2),(580,8,'16C','PREMIUM_ECONOMY','AISLE',16,3),(581,8,'16D','PREMIUM_ECONOMY','MIDDLE',16,4),(582,8,'16E','PREMIUM_ECONOMY','MIDDLE',16,5),(583,8,'16F','PREMIUM_ECONOMY','WINDOW',16,6),(584,8,'17A','PREMIUM_ECONOMY','WINDOW',17,1),(585,8,'17B','PREMIUM_ECONOMY','MIDDLE',17,2),(586,8,'17C','PREMIUM_ECONOMY','AISLE',17,3),(587,8,'17D','PREMIUM_ECONOMY','MIDDLE',17,4),(588,8,'17E','PREMIUM_ECONOMY','MIDDLE',17,5),(589,8,'17F','PREMIUM_ECONOMY','WINDOW',17,6),(590,8,'18A','PREMIUM_ECONOMY','WINDOW',18,1),(591,8,'18B','PREMIUM_ECONOMY','MIDDLE',18,2),(592,8,'18C','PREMIUM_ECONOMY','AISLE',18,3),(593,8,'18D','PREMIUM_ECONOMY','MIDDLE',18,4),(594,8,'18E','PREMIUM_ECONOMY','MIDDLE',18,5),(595,8,'18F','PREMIUM_ECONOMY','WINDOW',18,6),(596,8,'19A','PREMIUM_ECONOMY','WINDOW',19,1),(597,8,'19B','PREMIUM_ECONOMY','MIDDLE',19,2),(598,8,'19C','PREMIUM_ECONOMY','AISLE',19,3),(599,8,'19D','PREMIUM_ECONOMY','MIDDLE',19,4),(600,8,'19E','PREMIUM_ECONOMY','MIDDLE',19,5),(601,8,'19F','PREMIUM_ECONOMY','WINDOW',19,6),(602,8,'20A','PREMIUM_ECONOMY','WINDOW',20,1),(603,8,'20B','PREMIUM_ECONOMY','MIDDLE',20,2),(604,8,'20C','PREMIUM_ECONOMY','AISLE',20,3),(605,8,'20D','PREMIUM_ECONOMY','MIDDLE',20,4),(606,8,'20E','PREMIUM_ECONOMY','MIDDLE',20,5),(607,8,'20F','PREMIUM_ECONOMY','WINDOW',20,6),(608,8,'21A','PREMIUM_ECONOMY','WINDOW',21,1),(609,8,'21B','PREMIUM_ECONOMY','MIDDLE',21,2),(610,8,'21C','PREMIUM_ECONOMY','AISLE',21,3),(611,8,'21D','PREMIUM_ECONOMY','MIDDLE',21,4),(612,8,'21E','PREMIUM_ECONOMY','MIDDLE',21,5),(613,8,'21F','PREMIUM_ECONOMY','WINDOW',21,6),(614,8,'22A','PREMIUM_ECONOMY','WINDOW',22,1),(615,8,'22B','PREMIUM_ECONOMY','MIDDLE',22,2),(616,8,'22C','PREMIUM_ECONOMY','AISLE',22,3),(617,8,'22D','PREMIUM_ECONOMY','MIDDLE',22,4),(618,8,'22E','PREMIUM_ECONOMY','MIDDLE',22,5),(619,8,'22F','PREMIUM_ECONOMY','WINDOW',22,6),(620,8,'23A','PREMIUM_ECONOMY','WINDOW',23,1),(621,8,'23B','PREMIUM_ECONOMY','MIDDLE',23,2),(622,8,'23C','PREMIUM_ECONOMY','AISLE',23,3),(623,8,'23D','PREMIUM_ECONOMY','MIDDLE',23,4),(624,8,'23E','PREMIUM_ECONOMY','MIDDLE',23,5),(625,8,'23F','PREMIUM_ECONOMY','WINDOW',23,6),(626,8,'24A','PREMIUM_ECONOMY','WINDOW',24,1),(627,8,'24B','PREMIUM_ECONOMY','MIDDLE',24,2),(628,8,'24C','PREMIUM_ECONOMY','AISLE',24,3),(629,8,'24D','PREMIUM_ECONOMY','MIDDLE',24,4),(630,8,'24E','PREMIUM_ECONOMY','MIDDLE',24,5),(631,8,'24F','PREMIUM_ECONOMY','WINDOW',24,6),(632,8,'25A','PREMIUM_ECONOMY','WINDOW',25,1),(633,8,'25B','PREMIUM_ECONOMY','MIDDLE',25,2),(634,8,'25C','PREMIUM_ECONOMY','AISLE',25,3),(635,8,'25D','PREMIUM_ECONOMY','MIDDLE',25,4),(636,8,'25E','PREMIUM_ECONOMY','MIDDLE',25,5),(637,8,'25F','PREMIUM_ECONOMY','WINDOW',25,6),(638,8,'26A','PREMIUM_ECONOMY','WINDOW',26,1),(639,8,'26B','PREMIUM_ECONOMY','MIDDLE',26,2),(640,8,'26C','PREMIUM_ECONOMY','AISLE',26,3),(641,8,'26D','PREMIUM_ECONOMY','MIDDLE',26,4),(642,8,'26E','PREMIUM_ECONOMY','MIDDLE',26,5),(643,8,'26F','PREMIUM_ECONOMY','WINDOW',26,6),(644,8,'27A','ECONOMY','WINDOW',27,1),(645,8,'27B','ECONOMY','MIDDLE',27,2),(646,8,'27C','ECONOMY','AISLE',27,3),(647,8,'27D','ECONOMY','MIDDLE',27,4),(648,8,'27E','ECONOMY','MIDDLE',27,5),(649,8,'27F','ECONOMY','WINDOW',27,6),(650,8,'28A','ECONOMY','WINDOW',28,1),(651,8,'28B','ECONOMY','MIDDLE',28,2),(652,8,'28C','ECONOMY','AISLE',28,3),(653,8,'28D','ECONOMY','MIDDLE',28,4),(654,8,'28E','ECONOMY','MIDDLE',28,5),(655,8,'28F','ECONOMY','WINDOW',28,6),(656,8,'29A','ECONOMY','WINDOW',29,1),(657,8,'29B','ECONOMY','MIDDLE',29,2),(658,8,'29C','ECONOMY','AISLE',29,3),(659,8,'29D','ECONOMY','MIDDLE',29,4),(660,8,'29E','ECONOMY','MIDDLE',29,5),(661,8,'29F','ECONOMY','WINDOW',29,6),(662,8,'30A','ECONOMY','WINDOW',30,1),(663,8,'30B','ECONOMY','MIDDLE',30,2),(664,8,'30C','ECONOMY','AISLE',30,3),(665,8,'30D','ECONOMY','MIDDLE',30,4),(666,8,'30E','ECONOMY','MIDDLE',30,5),(667,8,'30F','ECONOMY','WINDOW',30,6),(668,8,'31A','ECONOMY','WINDOW',31,1),(669,8,'31B','ECONOMY','MIDDLE',31,2),(670,8,'31C','ECONOMY','AISLE',31,3),(671,8,'31D','ECONOMY','MIDDLE',31,4),(672,8,'31E','ECONOMY','MIDDLE',31,5),(673,8,'31F','ECONOMY','WINDOW',31,6),(674,8,'32A','ECONOMY','WINDOW',32,1),(675,8,'32B','ECONOMY','MIDDLE',32,2),(676,8,'32C','ECONOMY','AISLE',32,3),(677,8,'32D','ECONOMY','MIDDLE',32,4),(678,8,'32E','ECONOMY','MIDDLE',32,5),(679,8,'32F','ECONOMY','WINDOW',32,6),(680,8,'33A','ECONOMY','WINDOW',33,1),(681,8,'33B','ECONOMY','MIDDLE',33,2),(682,8,'33C','ECONOMY','AISLE',33,3),(683,8,'33D','ECONOMY','MIDDLE',33,4),(684,8,'33E','ECONOMY','MIDDLE',33,5),(685,8,'33F','ECONOMY','WINDOW',33,6),(686,8,'34A','ECONOMY','WINDOW',34,1),(687,8,'34B','ECONOMY','MIDDLE',34,2),(688,8,'34C','ECONOMY','AISLE',34,3),(689,8,'34D','ECONOMY','MIDDLE',34,4),(690,8,'34E','ECONOMY','MIDDLE',34,5),(691,8,'34F','ECONOMY','WINDOW',34,6),(692,8,'35A','ECONOMY','WINDOW',35,1),(693,8,'35B','ECONOMY','MIDDLE',35,2),(694,8,'35C','ECONOMY','AISLE',35,3),(695,8,'35D','ECONOMY','MIDDLE',35,4),(696,8,'35E','ECONOMY','MIDDLE',35,5),(697,8,'35F','ECONOMY','WINDOW',35,6),(698,8,'36A','ECONOMY','WINDOW',36,1),(699,8,'36B','ECONOMY','MIDDLE',36,2),(700,8,'36C','ECONOMY','AISLE',36,3),(701,8,'36D','ECONOMY','MIDDLE',36,4),(702,8,'36E','ECONOMY','MIDDLE',36,5),(703,8,'36F','ECONOMY','WINDOW',36,6),(704,8,'37A','ECONOMY','WINDOW',37,1),(705,8,'37B','ECONOMY','MIDDLE',37,2),(706,8,'37C','ECONOMY','AISLE',37,3),(707,8,'37D','ECONOMY','MIDDLE',37,4),(708,8,'37E','ECONOMY','MIDDLE',37,5),(709,8,'37F','ECONOMY','WINDOW',37,6),(710,8,'38A','ECONOMY','WINDOW',38,1),(711,8,'38B','ECONOMY','MIDDLE',38,2),(712,8,'38C','ECONOMY','AISLE',38,3),(713,8,'38D','ECONOMY','MIDDLE',38,4),(714,8,'38E','ECONOMY','MIDDLE',38,5),(715,8,'38F','ECONOMY','WINDOW',38,6),(716,8,'39A','ECONOMY','WINDOW',39,1),(717,8,'39B','ECONOMY','MIDDLE',39,2),(718,8,'39C','ECONOMY','AISLE',39,3),(719,8,'39D','ECONOMY','MIDDLE',39,4),(720,8,'39E','ECONOMY','MIDDLE',39,5),(721,8,'39F','ECONOMY','WINDOW',39,6),(722,8,'40A','ECONOMY','WINDOW',40,1),(723,8,'40B','ECONOMY','MIDDLE',40,2),(724,8,'40C','ECONOMY','AISLE',40,3),(725,8,'40D','ECONOMY','MIDDLE',40,4),(726,8,'40E','ECONOMY','MIDDLE',40,5),(727,8,'40F','ECONOMY','WINDOW',40,6);
/*!40000 ALTER TABLE `seat_map` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `flight_id` int NOT NULL,
  `passenger_id` int NOT NULL,
  `price_id` int NOT NULL,
  `flight_seat_id` int DEFAULT NULL,
  `ticket_number` varchar(20) DEFAULT NULL,
  `status` enum('Issued','CheckedIn','Boarded','Cancelled','Refunded') DEFAULT 'Issued',
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `flight_seat_id` (`flight_seat_id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `booking_id` (`booking_id`),
  KEY `passenger_id` (`passenger_id`),
  KEY `price_id` (`price_id`),
  KEY `idx_ticket_flight_passenger` (`flight_id`,`passenger_id`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`flight_id`),
  CONSTRAINT `ticket_ibfk_3` FOREIGN KEY (`passenger_id`) REFERENCES `passenger` (`passenger_id`),
  CONSTRAINT `ticket_ibfk_4` FOREIGN KEY (`price_id`) REFERENCES `flight_price` (`price_id`),
  CONSTRAINT `ticket_ibfk_5` FOREIGN KEY (`flight_seat_id`) REFERENCES `flight_seat` (`flight_seat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_class`
--

DROP TABLE IF EXISTS `ticket_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_class` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `class_name` varchar(50) NOT NULL,
  `baggage_allowance_kg` int DEFAULT '20',
  `refundable` tinyint(1) DEFAULT '0',
  `changeable` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `class_name` (`class_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_class`
--

LOCK TABLES `ticket_class` WRITE;
/*!40000 ALTER TABLE `ticket_class` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_verified` tinyint(1) DEFAULT '0',
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'dllv@gmail.com','admin','$2a$10$wdLr0EDdzNcoPQugVhSnd.qoLgwn2yPt04MGv9mZkYKlwo/H.gLma','Dao Le Long Vu','000000000','2005-09-06','Male',1,0,NULL,'2025-10-20 01:17:01','2025-10-20 01:17:01'),(2,'Daolelongvu1000@gmail.com','daolelongvu','$2a$10$YHD/IQWm5p0tgJPlGr.z0eeBJjgIPtBSr9/ihLZJ82ZasN6Qb0HS.','Dao Le Long Vu','0366873718','2005-06-05','Male',1,0,'default avatar','2025-10-30 03:57:53','2025-10-30 03:57:53');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`user_id`,`role_name`),
  KEY `role_name` (`role_name`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_name`) REFERENCES `role` (`role_name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,'ADMIN'),(2,'USER');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher`
--

DROP TABLE IF EXISTS `voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher` (
  `voucher_id` int NOT NULL AUTO_INCREMENT,
  `voucher_code` varchar(50) NOT NULL,
  `discount_type` enum('Percentage','Fixed Amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `usage_limit` int DEFAULT '1',
  `used_count` int DEFAULT '0',
  `valid_from` datetime NOT NULL,
  `valid_to` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`voucher_id`),
  UNIQUE KEY `voucher_code` (`voucher_code`),
  CONSTRAINT `voucher_chk_1` CHECK ((`valid_to` > `valid_from`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_usage`
--

DROP TABLE IF EXISTS `voucher_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_usage` (
  `usage_id` int NOT NULL AUTO_INCREMENT,
  `voucher_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `user_id` int NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usage_id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `voucher_id` (`voucher_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `voucher_usage_ibfk_1` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`),
  CONSTRAINT `voucher_usage_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `voucher_usage_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_usage`
--

LOCK TABLES `voucher_usage` WRITE;
/*!40000 ALTER TABLE `voucher_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_usage` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-13 23:26:52
