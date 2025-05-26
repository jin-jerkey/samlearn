-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 17, 2025 at 12:44 PM
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
-- Table structure for table `commentaires`
--

CREATE TABLE `commentaires` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `note` int(11) DEFAULT NULL CHECK (`note` >= 1 and `note` <= 5),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commentaires`
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
 

--
-- Table structure for table `eleve_cours`
--

CREATE TABLE `eleve_cours` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `date_inscription` datetime DEFAULT current_timestamp(),
  `est_termine` tinyint(1) DEFAULT 0,
  `pourcentage_progression` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_cours`
--


-- --------------------------------------------------------

--
-- Table structure for table `eleve_examen_resultats`
--

CREATE TABLE `eleve_examen_resultats` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `examen_id` int(11) NOT NULL,
  `date_passage` datetime DEFAULT current_timestamp(),
  `score` float NOT NULL,
  `est_reussi` tinyint(1) DEFAULT 0,
  `tentative` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_examen_resultats`
--
 

-- --------------------------------------------------------

--
-- Table structure for table `eleve_module_progression`
--

CREATE TABLE `eleve_module_progression` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `date_debut` datetime DEFAULT current_timestamp(),
  `date_completion` datetime DEFAULT NULL,
  `est_complete` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_module_progression`
--

 

-- --------------------------------------------------------

--
-- Table structure for table `eleve_quiz_reponses`
--

CREATE TABLE `eleve_quiz_reponses` (
  `id` int(11) NOT NULL,
  `eleve_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `examen_resultat_id` int(11) NOT NULL,
  `reponse_donnee` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `est_correcte` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eleve_quiz_reponses`
--
 

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

 

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `examen_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `reponse_correcte` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Stocke les index (0-based) des réponses correctes dans le tableau options',
  `points` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizzes`
--
 
 

-- --------------------------------------------------------

--
-- Table structure for table `reponsecommentaires`
--

CREATE TABLE `reponsecommentaires` (
  `id` int(11) NOT NULL,
  `formateur_id` int(11) NOT NULL,
  `commentaire_id` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table pour les conversations du chatbot
--
CREATE TABLE `chatbot_conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eleve_id` int(11) NOT NULL,
  `cours_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `reponse` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `eleve_id` (`eleve_id`),
  KEY `cours_id` (`cours_id`),
  CONSTRAINT `chatbot_conversations_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  CONSTRAINT `chatbot_conversations_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ajouter un administrateur par défaut avec un hash bcrypt valide
INSERT INTO `admin` (`nom`, `email`, `password_hash`) VALUES
('Admin', 'admin@samlearn.com', '$2b$12$1UEpzeFXKytVdxtnqwq4Z.h4A/OzuBoOHxbvX6eVlX6VusXQoUr9.');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `commentaires`
--
ALTER TABLE `commentaires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eleve_id` (`eleve_id`),
  ADD KEY `cours_id` (`cours_id`);

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
-- Indexes for table `eleve_examen_resultats`
--
ALTER TABLE `eleve_examen_resultats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eleve_id` (`eleve_id`),
  ADD KEY `examen_id` (`examen_id`);

--
-- Indexes for table `eleve_module_progression`
--
ALTER TABLE `eleve_module_progression`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_eleve_module` (`eleve_id`,`module_id`),
  ADD KEY `module_id` (`module_id`);

--
-- Indexes for table `eleve_quiz_reponses`
--
ALTER TABLE `eleve_quiz_reponses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `eleve_id` (`eleve_id`),
  ADD KEY `quiz_id` (`quiz_id`),
  ADD KEY `examen_resultat_id` (`examen_resultat_id`);

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
-- Indexes for table `reponsecommentaires`
--
ALTER TABLE `reponsecommentaires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `formateur_id` (`formateur_id`),
  ADD KEY `commentaire_id` (`commentaire_id`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `commentaires`
--
ALTER TABLE `commentaires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cours`
--
ALTER TABLE `cours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `eleve`
--
ALTER TABLE `eleve`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `eleve_cours`
--
ALTER TABLE `eleve_cours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `eleve_examen_resultats`
--
ALTER TABLE `eleve_examen_resultats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `eleve_module_progression`
--
ALTER TABLE `eleve_module_progression`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `eleve_quiz_reponses`
--
ALTER TABLE `eleve_quiz_reponses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `examens`
--
ALTER TABLE `examens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `formateur`
--
ALTER TABLE `formateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reponsecommentaires`
--
ALTER TABLE `reponsecommentaires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `commentaires`
--
ALTER TABLE `commentaires`
  ADD CONSTRAINT `commentaires_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `commentaires_ibfk_2` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`);

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
-- Constraints for table `eleve_examen_resultats`
--
ALTER TABLE `eleve_examen_resultats`
  ADD CONSTRAINT `eleve_examen_resultats_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `eleve_examen_resultats_ibfk_2` FOREIGN KEY (`examen_id`) REFERENCES `examens` (`id`);

--
-- Constraints for table `eleve_module_progression`
--
ALTER TABLE `eleve_module_progression`
  ADD CONSTRAINT `eleve_module_progression_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `eleve_module_progression_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`);

--
-- Constraints for table `eleve_quiz_reponses`
--
ALTER TABLE `eleve_quiz_reponses`
  ADD CONSTRAINT `eleve_quiz_reponses_ibfk_1` FOREIGN KEY (`eleve_id`) REFERENCES `eleve` (`id`),
  ADD CONSTRAINT `eleve_quiz_reponses_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`),
  ADD CONSTRAINT `eleve_quiz_reponses_ibfk_3` FOREIGN KEY (`examen_resultat_id`) REFERENCES `eleve_examen_resultats` (`id`);

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

--
-- Constraints for table `reponsecommentaires`
--
ALTER TABLE `reponsecommentaires`
  ADD CONSTRAINT `reponsecommentaires_ibfk_1` FOREIGN KEY (`formateur_id`) REFERENCES `formateur` (`id`),
  ADD CONSTRAINT `reponsecommentaires_ibfk_2` FOREIGN KEY (`commentaire_id`) REFERENCES `commentaires` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
