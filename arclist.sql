-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: localhost    Database: arclist_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'b85a29f2-1f64-11f1-b1be-f39e3d56f9dd:1-474';

--
-- Table structure for table `daily_evaluations`
--

DROP TABLE IF EXISTS `daily_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_evaluations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_date` date NOT NULL,
  `completion_percentage` decimal(5,2) DEFAULT '0.00',
  `completed_tasks_count` int DEFAULT '0',
  `pending_tasks_count` int DEFAULT '0',
  `overdue_tasks_count` int DEFAULT '0',
  `strongest_category` varchar(100) DEFAULT NULL,
  `most_skipped_category` varchar(100) DEFAULT NULL,
  `total_estimated_minutes_completed` int DEFAULT '0',
  `consistency_score` decimal(5,2) DEFAULT '0.00',
  `summary_note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_evaluation_date` (`user_id`,`plan_date`),
  CONSTRAINT `daily_evaluations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_evaluations`
--

LOCK TABLES `daily_evaluations` WRITE;
/*!40000 ALTER TABLE `daily_evaluations` DISABLE KEYS */;
INSERT INTO `daily_evaluations` VALUES (1,2,'2026-04-05',50.00,1,1,0,'Fitness','Language',40,65.00,'Completed 1 tasks • 50% completion • strongest category: Fitness','2026-04-05 01:16:33','2026-04-05 01:21:09'),(4,1,'2026-04-05',0.00,0,0,0,NULL,NULL,0,0.00,'Completed 0 tasks • 0% completion','2026-04-05 13:12:40','2026-04-05 13:12:40'),(5,1,'2026-04-07',100.00,1,0,0,'Uncategorized',NULL,40,100.00,'Completed 1 tasks • 100% completion • strongest category: Uncategorized','2026-04-07 07:11:48','2026-04-07 07:11:48');
/*!40000 ALTER TABLE `daily_evaluations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `day_plan_tasks`
--

DROP TABLE IF EXISTS `day_plan_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `day_plan_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `day_plan_id` int NOT NULL,
  `task_id` int NOT NULL,
  `sort_order` int DEFAULT '0',
  `planned_start` datetime DEFAULT NULL,
  `planned_end` datetime DEFAULT NULL,
  `added_after_lock` tinyint(1) DEFAULT '0',
  `completed_in_plan` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_plan_task` (`day_plan_id`,`task_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `day_plan_tasks_ibfk_1` FOREIGN KEY (`day_plan_id`) REFERENCES `day_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `day_plan_tasks_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `day_plan_tasks`
--

LOCK TABLES `day_plan_tasks` WRITE;
/*!40000 ALTER TABLE `day_plan_tasks` DISABLE KEYS */;
INSERT INTO `day_plan_tasks` VALUES (1,1,6,0,'2026-04-05 02:01:00','2026-04-05 02:02:00',0,0,'2026-04-05 00:58:57'),(2,1,4,0,'2026-04-05 02:21:00','2026-04-05 02:22:00',1,0,'2026-04-05 01:20:13'),(3,3,23,0,NULL,NULL,0,0,'2026-04-07 07:05:16'),(4,3,24,0,NULL,NULL,1,0,'2026-04-07 07:15:07'),(5,3,25,0,NULL,NULL,1,0,'2026-04-07 10:21:03');
/*!40000 ALTER TABLE `day_plan_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `day_plans`
--

DROP TABLE IF EXISTS `day_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `day_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_date` date NOT NULL,
  `planning_mode` enum('todo','timetable') DEFAULT 'todo',
  `notes` text,
  `is_locked` tinyint(1) DEFAULT '0',
  `locked_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_plan_date` (`user_id`,`plan_date`),
  CONSTRAINT `day_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `day_plans`
--

LOCK TABLES `day_plans` WRITE;
/*!40000 ALTER TABLE `day_plans` DISABLE KEYS */;
INSERT INTO `day_plans` VALUES (1,2,'2026-04-05','todo','',1,'2026-04-05 01:59:07','2026-04-05 00:57:23','2026-04-05 01:20:32'),(2,1,'2026-04-05','todo',NULL,0,NULL,'2026-04-05 13:23:55','2026-04-05 13:23:55'),(3,1,'2026-04-07','todo','',1,'2026-04-07 08:05:31','2026-04-07 07:01:57','2026-04-07 07:15:53'),(4,2,'2026-04-07','todo',NULL,0,NULL,'2026-04-07 08:40:50','2026-04-07 08:40:50');
/*!40000 ALTER TABLE `day_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friend_requests`
--

DROP TABLE IF EXISTS `friend_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friend_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `status` enum('pending','accepted','rejected','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pending_pair` (`sender_id`,`receiver_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `friend_requests_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friend_requests_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friend_requests`
--

LOCK TABLES `friend_requests` WRITE;
/*!40000 ALTER TABLE `friend_requests` DISABLE KEYS */;
INSERT INTO `friend_requests` VALUES (1,1,2,'accepted','2026-04-07 10:46:19','2026-04-07 10:46:59');
/*!40000 ALTER TABLE `friend_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `friend_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_friend_pair` (`user_id`,`friend_id`),
  KEY `friend_id` (`friend_id`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES (1,1,2,'2026-04-07 10:46:59'),(2,2,1,'2026-04-07 10:46:59');
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `body` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,2,'Heyy Dara',1,'2026-04-07 11:23:55'),(2,1,2,'What\'s good?',1,'2026-04-07 11:24:08'),(3,2,1,'I\'m Alright, Message testing successful',1,'2026-04-07 11:24:59'),(4,1,2,'Wonderful',0,'2026-04-07 11:35:54');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('task_reminder','overdue_alert','daily_review','collaboration','system') DEFAULT 'system',
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `related_task_id` int DEFAULT NULL,
  `scheduled_for` datetime DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `is_sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `related_request_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `related_task_id` (`related_task_id`),
  KEY `fk_notifications_related_request` (`related_request_id`),
  CONSTRAINT `fk_notifications_related_request` FOREIGN KEY (`related_request_id`) REFERENCES `friend_requests` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`related_task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'overdue_alert','Task overdue','\"Assignment\" is overdue. Try to reschedule it or clear it today.',24,'2026-04-06 08:10:00',0,0,'2026-04-07 08:05:21','2026-04-07 08:05:21',NULL),(2,1,'daily_review','Daily review','You still have 1 unfinished task. Review your day and close it out well.',NULL,'2026-04-07 09:05:21',0,0,'2026-04-07 08:05:21','2026-04-07 08:05:21',NULL),(3,1,'task_reminder','Task reminder','Your task \"Coding\" is due for attention now.',23,'2026-04-07 08:11:00',0,0,'2026-04-07 08:05:53','2026-04-07 08:05:53',NULL),(5,1,'overdue_alert','Task overdue','\"Coding\" is overdue. Try to reschedule it or clear it today.',23,'2026-04-07 08:10:00',1,0,'2026-04-07 08:05:53','2026-04-07 10:35:43',NULL),(7,2,'daily_review','Daily review','You still have 20 unfinished tasks. Review your day and close it out well.',NULL,'2026-04-07 09:40:41',0,0,'2026-04-07 08:40:41','2026-04-07 08:40:41',NULL),(9,2,'system','New friend request','Someone sent you a friend request.',NULL,'2026-04-07 11:46:20',0,0,'2026-04-07 10:46:19','2026-04-07 10:46:19',NULL),(10,1,'system','Friend request accepted','Your friend request was accepted.',NULL,'2026-04-07 11:46:59',1,0,'2026-04-07 10:46:59','2026-04-07 11:01:55',NULL),(11,1,'task_reminder','Task reminder','Your task \"Practice Drawing\" is due for attention now.',25,'2026-04-07 12:22:00',0,0,'2026-04-07 11:23:40','2026-04-07 11:23:40',NULL),(12,1,'overdue_alert','Task overdue','\"Practice Drawing\" is overdue. Try to reschedule it or clear it today.',25,'2026-04-07 12:23:00',0,0,'2026-04-07 11:23:40','2026-04-07 11:23:40',NULL),(13,2,'system','New message','You received a new message from a friend.',NULL,'2026-04-07 12:23:55',0,0,'2026-04-07 11:23:55','2026-04-07 11:23:55',NULL),(14,2,'system','New message','You received a new message from a friend.',NULL,'2026-04-07 12:24:09',0,0,'2026-04-07 11:24:08','2026-04-07 11:24:08',NULL),(15,1,'system','New message','You received a new message from a friend.',NULL,'2026-04-07 12:24:59',0,0,'2026-04-07 11:24:59','2026-04-07 11:24:59',NULL),(16,2,'system','New message','You received a new message from a friend.',NULL,'2026-04-07 12:35:54',0,0,'2026-04-07 11:35:54','2026-04-07 11:35:54',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_tags`
--

DROP TABLE IF EXISTS `task_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(20) NOT NULL DEFAULT '#720137',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `task_tags_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_tags`
--

LOCK TABLES `task_tags` WRITE;
/*!40000 ALTER TABLE `task_tags` DISABLE KEYS */;
INSERT INTO `task_tags` VALUES (1,2,'Growth','#8B1E3F','2026-04-05 00:28:31'),(2,2,'Learning','#5C2E91','2026-04-05 00:28:31'),(3,2,'Creative','#C15F3C','2026-04-05 00:28:31'),(4,2,'Fitness','#2C8C6B','2026-04-05 00:28:31'),(5,2,'Language','#3F6ED8','2026-04-05 00:28:31'),(6,2,'Reading','#8C6A2C','2026-04-05 00:28:31'),(7,2,'Research','#6B7280','2026-04-05 00:28:31');
/*!40000 ALTER TABLE `task_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','archived') DEFAULT 'pending',
  `planning_mode` enum('todo','timetable') DEFAULT 'todo',
  `difficulty_level` tinyint DEFAULT '3',
  `estimated_minutes` int DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `reminder_at` datetime DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT '0',
  `recurrence_pattern` varchar(50) DEFAULT NULL,
  `tag_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `task_tags` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,2,'Spend 30 minutes on personal growth','Starter self-development task','medium','pending','todo',3,30,NULL,NULL,0,NULL,1,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(2,2,'Learn something outside my course','Explore knowledge beyond formal coursework','medium','completed','todo',3,45,NULL,NULL,0,NULL,2,'2026-04-05 00:28:31','2026-04-05 01:18:52','2026-04-05 02:18:52'),(3,2,'Explore one tech topic','Read or watch something related to technology','medium','pending','todo',3,45,NULL,NULL,0,NULL,2,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(4,2,'Practice a new language','Vocabulary, listening, or speaking practice','medium','pending','todo',3,30,NULL,NULL,0,NULL,5,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(5,2,'Improve speaking through practice','Speaking drills or presentation-style practice','medium','pending','todo',3,20,NULL,NULL,0,NULL,5,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(6,2,'Do a physical fitness session','General body movement or workout','high','completed','todo',4,40,NULL,NULL,0,NULL,4,'2026-04-05 00:28:31','2026-04-05 01:22:12','2026-04-05 02:22:13'),(7,2,'Practice calisthenics','Bodyweight training session','high','pending','todo',4,35,NULL,NULL,0,NULL,4,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(8,2,'Work on crocheting','Spend time developing crocheting skill','low','pending','todo',2,45,NULL,NULL,0,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(9,2,'Practice drawing','Sketching or drawing improvement session','medium','pending','todo',3,40,NULL,NULL,0,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(10,2,'Practice painting','Painting session for improvement or expression','medium','pending','todo',3,45,NULL,NULL,0,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(11,2,'Read fiction','Read fiction for learning or enjoyment','low','pending','todo',2,30,NULL,NULL,0,NULL,6,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(12,2,'Read non-fiction','Read educational or reflective material','medium','pending','todo',3,30,NULL,NULL,0,NULL,6,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(13,2,'Write fiction','Creative writing practice','medium','pending','todo',3,40,NULL,NULL,0,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(14,2,'Journal for the day','Reflect and write daily thoughts','medium','pending','todo',2,15,NULL,NULL,0,NULL,1,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(15,2,'Practice singing','Voice or song practice','low','pending','todo',2,25,NULL,NULL,0,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(16,2,'Learn a constellation','Study one constellation and its features','low','pending','todo',2,20,NULL,NULL,0,NULL,2,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(17,2,'Memorize 5 countries','Learn and retain names or locations of countries','low','pending','todo',2,15,NULL,NULL,0,NULL,2,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(18,2,'Write or study a poem this week','Weekly poetry engagement','medium','pending','todo',3,25,NULL,NULL,0,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(19,2,'Identify a plant','Study and recognize a plant','low','pending','todo',2,15,NULL,NULL,0,NULL,7,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(20,2,'Research a controversial topic','Explore a complex topic from multiple angles','medium','pending','todo',4,45,NULL,NULL,0,NULL,7,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(21,2,'Study the history of a famous person','Read about someone influential','low','pending','todo',2,25,NULL,NULL,0,NULL,7,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(22,2,'Practice acrylic painting','Acrylic-specific painting session','medium','pending','todo',3,45,NULL,NULL,0,NULL,3,'2026-04-05 00:28:31','2026-04-05 00:28:31',NULL),(23,1,'Coding','Finish Todo list site','medium','completed','todo',4,40,'2026-04-07 08:10:00','2026-04-07 08:11:00',0,NULL,NULL,'2026-04-07 07:05:02','2026-04-07 10:09:54','2026-04-07 11:09:54'),(24,1,'Assignment','Finish modelling assignments','medium','completed','todo',3,NULL,'2026-04-06 08:10:00',NULL,0,NULL,NULL,'2026-04-07 07:14:33','2026-04-07 10:19:33','2026-04-07 11:19:34'),(25,1,'Practice Drawing','Use hb pencils','low','pending','todo',3,15,'2026-04-07 12:23:00','2026-04-07 12:22:00',0,NULL,NULL,'2026-04-07 10:20:47','2026-04-07 10:20:47',NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `display_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `bio` text,
  `favourite_hobby` varchar(100) DEFAULT NULL,
  `theme_name` varchar(100) DEFAULT 'Summer Raspberry',
  `install_prompt_dismissed` tinyint(1) DEFAULT '0',
  `install_prompt_installed` tinyint(1) DEFAULT '0',
  `login_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `theme` varchar(50) DEFAULT 'summer-raspberry',
  `default_planning_mode` enum('todo','timetable') DEFAULT 'todo',
  `default_task_duration` int DEFAULT '30',
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `notification_enabled` tinyint(1) DEFAULT '1',
  `daily_review_reminder` tinyint(1) DEFAULT '1',
  `collaboration_notifications` tinyint(1) DEFAULT '1',
  `privacy_profile_visibility` enum('private','friends','public') DEFAULT 'friends',
  `allow_friend_requests` tinyint(1) DEFAULT '1',
  `allow_collaboration` tinyint(1) DEFAULT '1',
  `preferred_planning_mode` enum('todo','timetable') DEFAULT 'todo',
  `notifications_enabled` tinyint(1) DEFAULT '1',
  `reminder_notifications` tinyint(1) DEFAULT '1',
  `daily_review_notifications` tinyint(1) DEFAULT '1',
  `profile_visibility` enum('private','friends','public') DEFAULT 'friends',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'George Jnr','george','georgejnr31@gmail.com','$2b$12$ICt9Qx5M6qxoinS5qM5nl.A32X2mS0WtszIkMqOLcuSOL9TG9XlsK','https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_incoming&w=740&q=80',NULL,NULL,'Summer Raspberry',0,0,6,'2026-04-04 23:08:24','2026-04-07 15:45:43','forest-velvet','timetable',30,NULL,1,1,1,'friends',1,1,'todo',1,1,1,'friends'),(2,'Potato','daraandy','daramfon.andy2@gmail.com','$2b$12$JsUM.T7E7P.aDCtt7VF6o.nWJ9O/KRBjU0ZZtUFmujBM4zWRg62He',NULL,NULL,NULL,'Summer Raspberry',0,0,3,'2026-04-05 00:18:53','2026-04-07 11:24:21','midnight-indigo','todo',30,NULL,1,1,1,'friends',1,1,'todo',1,1,1,'friends');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08  5:40:34
