 SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP TABLE IF EXISTS `user_event_switch`;
CREATE TABLE `user_event_switch` (
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_editor` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;


DROP TABLE IF EXISTS `friend`;
CREATE TABLE `friend` (
  `id` int(11) NOT NULL,
  `src_user_id` int(11) NOT NULL,
  `dest_user_id` int(11) NOT NULL,
  `is_approved` tinyint(1) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

INSERT INTO `friend` (`id`, `src_user_id`, `dest_user_id`, `date`) VALUES
(1, 1, 3, '2022-10-05 17:07:10'),
(2, 3, 4, '2022-10-05 17:07:10'),
(3, 4, 1, '2022-10-05 17:07:10');


DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `src_user_id` int(11) NOT NULL,
  `dest_user_id` int(11) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `message` text COLLATE utf8_hungarian_ci NOT NULL,
  `is_public` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

INSERT INTO `post` (`id`, `src_user_id`, `dest_user_id`, `date`, `message`, `is_public`) VALUES
(1, 1, 3, '2022-10-05 18:52:14', 'Helló', 0),
(2, 3, 1, '2022-10-05 16:38:02', 'Helló', 0),
(3, 3, NULL, '2022-10-05 18:53:17', 'Sziasztok', 1);


DROP TABLE IF EXISTS `event`;
CREATE TABLE `event` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_hungarian_ci NOT NULL,
  `text` text COLLATE utf8_hungarian_ci NOT NULL,
  `place` varchar(50) COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

INSERT INTO `event` (`id`, `name`, `text`, `place`) VALUES
(1, 'Elek Birthday party', 'asdaadssdasd', 'Nagykanizsa'),
(2, 'Party', 'asdasdasdas', 'Zalaegerszeg'),
(3, 'Party', 'asdasdasdads', 'Budapest');


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(30) COLLATE utf8_hungarian_ci NOT NULL,
  `email` varchar(128) COLLATE utf8_hungarian_ci NOT NULL,
  `password` varchar(128) COLLATE utf8_hungarian_ci NOT NULL,
  `phone` varchar(12) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `profile` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `birth_day` date DEFAULT NULL,
  `birth_place` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `residence` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `profile`, `birth_day`, `birth_place`, `residence`) VALUES
(1, 'Remek Elek', 'kecske@gmail.com', '$2b$10$cKvUE49ScoZKyfgsk9ARWuWSJH74A9ry3abz4MC4HidLvmIEVC5uq', '06308218311', NULL, '2004-03-09', 'Budapest', 'Budapest'),
(3, 'Kasza Blanka', 'jelszó@gmail.com', '$2b$10$oXg1Sg56GG4uKLrpPBMilOK/fDad2N02uQiZP7H7zuDEHhFwApXta', '06301578984', NULL, '2004-03-10', 'Debrecen', 'Debrecen'),
(4, 'Kér Ede', 'asdasd@gmail.com', '$2b$10$BU90mYAR1jV/8U/BzQKu8uSSxeWMl/MaC1afHzSBiMuRFapRHYbna', '06301478526', NULL, '2005-10-11', 'Zalaegerszeg', 'Körmend');

INSERT INTO `user_event_switch` (`user_id`, `event_id`, `date`, `is_editor`) VALUES
(1, 2, '2022-10-05 17:04:46', 1),
(3, 1, '2022-10-05 17:05:55', 1),
(3, 3, '2022-10-05 17:05:55', 1);

ALTER TABLE `friend`
  ADD PRIMARY KEY (`id`),
  ADD KEY `friend_fk_1` (`src_user_id`),
  ADD KEY `friend_fk_2` (`dest_user_id`);

ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_fk1` (`src_user_id`),
  ADD KEY `post_fk2` (`dest_user_id`);

ALTER TABLE `event`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `user_event_switch`
  ADD KEY `user_event_switch_fk1` (`user_id`),
  ADD KEY `user_event_switch_fk_1` (`event_id`);

ALTER TABLE `friend`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `event`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `friend`
 ADD CONSTRAINT `friend_fk_1` FOREIGN KEY (`src_user_id`) REFERENCES `user` (`id`),
 ADD CONSTRAINT `friend_fk_2` FOREIGN KEY (`dest_user_id`) REFERENCES `user` (`id`);

ALTER TABLE `post`
  ADD CONSTRAINT `post_fk1` FOREIGN KEY (`src_user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `post_fk2` FOREIGN KEY (`dest_user_id`) REFERENCES `user` (`id`);

ALTER TABLE `user_event_switch`
  ADD CONSTRAINT `user_event_switch_fk1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `user_event_switch_fk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`ID`);
COMMIT;
