-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 25, 2025 at 02:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `samlearn`
--

-- --------------------------------------------------------

--
-- Table structure for table `cours`
--

CREATE TABLE `cours` (
  `id` int(11) NOT NULL,
  `formateur_id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `difficulty_level` enum('débutant','intermédiaire','avancé') DEFAULT NULL,
  `langue` varchar(20) DEFAULT 'Français',
  `duree_estimee` int(11) DEFAULT NULL,
  `prerequis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prerequis`)),
  `mots_cles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mots_cles`)),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cours`
--

INSERT INTO `cours` (`id`, `formateur_id`, `titre`, `description`, `category`, `difficulty_level`, `langue`, `duree_estimee`, `prerequis`, `mots_cles`, `created_at`) VALUES
(1, 1, 'la physique avec papa wemba', 'apprendre les bien fait de la physique ', 'Physique', '', 'Français', 2, '[\"base de physique\"]', '[\"physique\"]', '2025-03-21 14:38:17'),
(2, 1, 'limite d\'une fonction', 'Apprendre facilement les limites ', 'Mathématiques', '', 'Français', 2, '[\"g\\u00e9ometrie\"]', '[\"mathematique\"]', '2025-03-21 15:47:55'),
(3, 1, 'equation du segond degré facile avec mama sam', 'Apprendre à faire des équations comme un enfant du CM2', 'Mathématiques', '', 'Français', 320, '[\"alg\\u00e9bre\"]', '[\"mathematique\"]', '2025-03-24 10:20:05'),
(4, 0, 'chime pour les null', 'fait de la chimie pour le monde', 'Chimie', '', 'Français', 400, '[\"chimie\"]', '[\"chimie\"]', '2025-03-25 12:58:21');

-- --------------------------------------------------------

--
-- Table structure for table `eleve`
--

CREATE TABLE `eleve` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `niveau` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve`
--

INSERT INTO `eleve` (`id`, `nom`, `prenom`, `email`, `password_hash`, `created_at`, `last_login`, `is_active`, `niveau`) VALUES
(1, 'Jerkey', 'Steve', 'stevejerkey@gmail.com', 'scrypt:32768:8:1$1NZniHedpDYWYOqo$4b7f36526cee42c175e64d9e1a7e599138f6246e7dd9393eee1b1540321638211a4519cedf90238ff13f982501e049e94c3110ec76d2ec0c58237553dbc677e8', '2025-03-19 16:56:05', '2025-03-25 13:12:50', 1, '1ereC');

-- --------------------------------------------------------

--
-- Table structure for table `eleve_cours`
--

CREATE TABLE `eleve_cours` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `date_inscription` datetime DEFAULT current_timestamp(),
  `est_termine` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_cours`
--

INSERT INTO `eleve_cours` (`id`, `eleve_id`, `cours_id`, `date_inscription`, `est_termine`) VALUES
(1, 1, 1, '2025-03-25 14:09:57', 0);

-- --------------------------------------------------------

--
-- Table structure for table `examens`
--

CREATE TABLE `examens` (
  `id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `seuil_reussite` float DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `examens`
--

INSERT INTO `examens` (`id`, `cours_id`, `titre`, `seuil_reussite`) VALUES
(1, 3, 'certifie toi', 50),
(2, 4, 'sdsdsdsdsds', 50);

-- --------------------------------------------------------

--
-- Table structure for table `formateur`
--

CREATE TABLE `formateur` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `bio` text DEFAULT NULL,
  `specialites` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specialites`)),
  `qualifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`qualifications`)),
  `taux_reussite` float DEFAULT NULL,
  `methode_pedagogique` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `formateur`
--

INSERT INTO `formateur` (`id`, `nom`, `prenom`, `email`, `password_hash`, `created_at`, `last_login`, `is_active`, `bio`, `specialites`, `qualifications`, `taux_reussite`, `methode_pedagogique`) VALUES
(0, 'zeufack', 'steve', 'steve@gmail.com', 'scrypt:32768:8:1$oEP6zGVExpheq0lx$b6f692644115a6fd484b1c64bf4fb6833e4f04c7055918b9aff490e03da04a59f4ed160683c7b06b7b213bd243f1bb5553fae13ee9e8565b663c4d9da5648d2b', '2025-03-25 12:56:34', '2025-03-25 13:03:53', 1, 'cvcvcvcvcvcdf', '[\"Chimie\", \"mathematique\", \"science\"]', '[\"bac\"]', NULL, 'Théorique'),
(1, 'jerkey', 'jin', 'jin@gmail.com', 'scrypt:32768:8:1$dRbWR2C8VmyDQ3nH$25b32b63f40b2257fc1826279d62a6e9c993ce88b973a16b93a2c176f6d587116c06033170af9aadc260fdf4b72452472b89d2b956361ace4f2206d0d60d78aa', '2025-03-21 11:50:15', '2025-03-25 13:30:52', 1, 'fdfdfdfdf', '[\"Chimie\", \"mathematique\", \"science\"]', '[\"bac\"]', NULL, 'Pratique');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `type` enum('document','texte','vidéo') NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `ordre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `cours_id`, `type`, `titre`, `contenu`, `ordre`) VALUES
(1, 1, 'texte', 'demarage', 'tout apprendre sur les competene en physique', 1),
(2, 1, 'document', 'tout a savoir', 'uploads\\modele-statuts-ohada-sas-1.pdf', 1),
(3, 1, 'vidéo', 'et de trois', 'uploads\\Home_-_X_2.mp4', 1),
(4, 3, 'document', 'boum', 'uploads\\BIIC_CardLess_Specification_ICPS-Middle.pdf', 1),
(5, 4, 'texte', 'dsd', 'sdsdsdsdsdsd', 1),
(6, 4, 'texte', 'dsdsds', 'sdsdsdsdsdsdfghhghg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `examen_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `reponse_correcte` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`reponse_correcte`)),
  `points` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `examen_id`, `question`, `options`, `reponse_correcte`, `points`) VALUES
(1, 1, 'qui est l\'autre ', '[\"boum\", \"baomm\", \"fdfd\", \"dfdfd\"]', '[]', 1),
(2, 2, 'fgfgfg', '[\"fgfgfgfg\", \"cvbvbv\", \"xcxcx\", \"jhjhj\"]', '[]', 10),
(3, 2, 'dfdfdf', '[\"fgfgfg\", \"dfd\", \"fgf\", \"ghgh\"]', '[]', 10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cours`
--
ALTER TABLE `cours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `formateur_id` (`formateur_id`);

--
-- Indexes for table `eleve`
--
ALTER TABLE `eleve`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`),
  ADD UNIQUE KEY `prenom` (`prenom`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `eleve_cours`
--
ALTER TABLE `eleve_cours`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_eleve_cours` (`eleve_id`,`cours_id`),
  ADD KEY `cours_id` (`cours_id`);

--
-- Indexes for table `examens`
--
ALTER TABLE `examens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cours_id` (`cours_id`);

--
-- Indexes for table `formateur`
--
ALTER TABLE `formateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cours_id` (`cours_id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `examen_id` (`examen_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cours`
--
ALTER TABLE `cours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `eleve_cours`
--
ALTER TABLE `eleve_cours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `examens`
--
ALTER TABLE `examens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cours`
--
ALTER TABLE `cours`
  ADD CONSTRAINT `cours_ibfk_1` FOREIGN KEY (`formateur_id`) REFERENCES `formateur` (`id`);

--
-- Constraints for table `eleve_cours`
--
ALTER TABLE `eleve_cours`
  ADD CONSTRAINT `eleve_cours_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `eleve_cours_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

--
-- Constraints for table `examens`
--
ALTER TABLE `examens`
  ADD CONSTRAINT `examens_ibfk_1` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`examen_id`) REFERENCES `examens` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
