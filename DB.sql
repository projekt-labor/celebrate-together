-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2022. Dec 06. 20:46
-- Kiszolgáló verziója: 10.4.18-MariaDB
-- PHP verzió: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `celebrate_together`
--
CREATE DATABASE IF NOT EXISTS `celebrate_together` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;
USE `celebrate_together`;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `comment`
--

DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `user_id` int(11) NOT NULL,
  `other_id` int(11) NOT NULL,
  `type` tinyint(1) DEFAULT NULL COMMENT 'T/F',
  `text` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `comment`
--

INSERT INTO `comment` (`user_id`, `other_id`, `type`, `text`, `date`) VALUES
(21, 8, 0, 'Teszt komment1', '2022-12-05 18:03:45'),
(21, 8, 0, 'Teszt komment2', '2022-12-05 18:03:45'),
(21, 8, 0, 'Teszt komment3', '2022-12-05 18:03:45'),
(21, 10, 1, 'Teszt szöveg eseményhez1', '2022-12-05 18:12:18'),
(21, 10, 1, 'Teszt szöveg eseményhez2', '2022-12-05 18:12:18'),
(21, 10, 1, 'Teszt szöveg eseményhez3', '2022-12-05 18:12:18');

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `comments`
-- (Lásd alább az aktuális nézetet)
--
DROP VIEW IF EXISTS `comments`;
CREATE TABLE `comments` (
`name` varchar(30)
,`profile` varchar(50)
,`text` varchar(40)
,`date` timestamp
,`user_id` int(11)
,`other_id` int(11)
,`location` varchar(5)
);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `event`
--

DROP TABLE IF EXISTS `event`;
CREATE TABLE `event` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_hungarian_ci NOT NULL,
  `text` text COLLATE utf8_hungarian_ci NOT NULL,
  `place` varchar(50) COLLATE utf8_hungarian_ci NOT NULL,
  `event_date` varchar(30) COLLATE utf8_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `event`
--

INSERT INTO `event` (`id`, `name`, `text`, `place`, `event_date`) VALUES
(1, 'Elek Szülinapi party', 'Mindenkit meghívok egy sörre!', 'Nagykanizsa', '2022-11-15'),
(6, 'Teszt Felhasználó saját eseménye!', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\r\n\r\n\r\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?', 'Nagykanizsa', '2022-12-12'),
(7, 'Általános iskolai osztály találkozó', 'Bárki jöhet az évfolyamból!', 'Székesfehérvár', '2022-12-20'),
(8, 'Teszt 2', 'Teszt2', 'Teszt helyszín', '2022-12-25'),
(9, 'Teszt 3', 'Teszt szöveg', 'Teszt helyszín', '2022-12-20'),
(10, 'Teszt 4', 'Teszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szövegTeszt szöveg', 'Teszt helyszín', '2022-12-14');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `friend`
--

DROP TABLE IF EXISTS `friend`;
CREATE TABLE `friend` (
  `id` int(11) NOT NULL,
  `src_user_id` int(11) NOT NULL,
  `dest_user_id` int(11) NOT NULL,
  `is_approved` tinyint(1) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `friend`
--

INSERT INTO `friend` (`id`, `src_user_id`, `dest_user_id`, `is_approved`, `date`) VALUES
(1, 1, 3, 0, '2022-10-05 15:07:10'),
(2, 3, 4, 1, '2022-10-14 11:35:11'),
(5, 4, 7, 1, '2022-10-14 11:27:04'),
(6, 7, 3, 1, '2022-10-14 12:16:56'),
(7, 4, 21, 0, '2022-11-25 13:29:13'),
(8, 1, 21, 0, '2022-11-25 13:29:31'),
(9, 21, 20, 0, '2022-11-25 13:31:21'),
(10, 19, 21, 1, '2022-11-25 13:42:32'),
(11, 20, 19, 1, '2022-11-25 14:03:29'),
(12, 1, 19, 1, '2022-11-25 14:03:31');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `post`
--

DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `src_user_id` int(11) NOT NULL,
  `dest_user_id` int(11) DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `message` text COLLATE utf8_hungarian_ci NOT NULL,
  `is_public` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `post`
--

INSERT INTO `post` (`id`, `src_user_id`, `dest_user_id`, `date`, `message`, `is_public`) VALUES
(3, 3, NULL, '2022-11-25 13:32:35', 'Kasza Blanka saját posztja! Figyelem, ez hosszú lesz:\n\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"', 1),
(7, 21, NULL, '2022-11-25 13:30:59', 'Ez egy saját poszt!', 1),
(8, 21, NULL, '2022-11-25 13:31:09', 'Töröld ezt a posztot', 1),
(9, 21, 19, '2022-11-25 13:30:18', 'Szia Teszt Felhasználó! ', 0),
(10, 19, 21, '2022-11-25 13:43:56', 'Szia Ödön :D', 0),
(11, 19, 21, '2022-11-25 13:43:59', 'Nem is tudtam hogy használod ezt az oldalt', 0),
(12, 19, 20, '2022-11-25 14:03:58', 'Szia! Gyere el: http://127.0.0.1:8080/event/7/altal%C3%A1nos-iskolai-oszt%C3%A1ly-tal%C3%A1lkoz%C3%B3', 0),
(13, 19, 1, '2022-11-25 14:04:08', 'Szia! Gyere el: http://127.0.0.1:8080/event/7/altal%C3%A1nos-iskolai-oszt%C3%A1ly-tal%C3%A1lkoz%C3%B3', 0),
(14, 20, NULL, '2022-11-25 14:05:28', 'Hívj csak kukoricának!', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(30) COLLATE utf8_hungarian_ci NOT NULL,
  `email` varchar(128) COLLATE utf8_hungarian_ci NOT NULL,
  `password` varchar(128) COLLATE utf8_hungarian_ci NOT NULL,
  `phone` varchar(12) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `profile` varchar(50) COLLATE utf8_hungarian_ci DEFAULT 'avatar1.png',
  `birth_day` date DEFAULT NULL,
  `birth_place` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `residence` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `profile`, `birth_day`, `birth_place`, `residence`) VALUES
(1, 'Remek Elek', 'remeke@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', '06308218311', 'avatar1.png', '2004-12-04', 'Budapest', 'Budapest'),
(3, 'Kasza Blanka', 'kaszab@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', '06301578984', 'avatar2.png', '2004-12-10', 'Debrecen', 'Debrecen'),
(4, 'Kér Ede', 'kere@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', '06301478526', 'avatar3.png', '2005-12-06', 'Zalaegerszeg', 'Körmend'),
(19, 'Zsíros B. Ödön', 'zsirosb@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', NULL, 'avatar4.png', '2000-12-03', NULL, NULL),
(20, 'Kukor Ica', 'kukori@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', NULL, 'avatar5.png', '2002-12-11', NULL, NULL),
(21, 'Teszt Felhasználó', 'teszt@teszt.teszt', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', NULL, 'avatar6.png', '1999-11-30', NULL, NULL),
(22, 'Példa Péter', 'peldap@gmail.com', '$2b$10$oBP.xqTsSBIUORlE8GkLD.hQWGJ7uHcXVoOXikUm1ZA06g7to.Ox2', NULL, 'avatar1.png', '2000-12-05', NULL, NULL);

--
-- Eseményindítók `user`
--
DROP TRIGGER IF EXISTS `delete_users`;
DELIMITER $$
CREATE TRIGGER `delete_users` BEFORE DELETE ON `user` FOR EACH ROW BEGIN
	DELETE from user_event_switch where user_id = OLD.id;
    DELETE from friend where src_user_id = OLD.id or dest_user_id = OLD.id;
    DELETE from post where src_user_id = OLD.id or dest_user_id = OLD.id;
    DELETE from comment where comment.user_id = OLD.id;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `insert_user`;
DELIMITER $$
CREATE TRIGGER `insert_user` BEFORE INSERT ON `user` FOR EACH ROW BEGIN
    DECLARE fs1 TEXT;
    DECLARE fs2 TEXT;
    Set fs1 = (SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(NEW.name, ' ', 2), ' ', -1));
    Set fs2 = (SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(NEW.name, ' ', 3), ' ', -1));
    IF(fs1 = fs2) THEN
       SET NEW.name = (SELECT CONCAT(CONCAT(UCASE(LEFT(NEW.name, 1)), LCASE(SUBSTRING(NEW.name, 2, LOCATE(" ", NEW.name)-1))),
	               CONCAT(UCASE(SUBSTRING(NEW.name, LOCATE(" ", NEW.name)+1,1)), LCASE(SUBSTRING(NEW.name, (LOCATE(" ", NEW.name)+2))))));
    ELSE
        SET NEW.name = (SELECT CONCAT(CONCAT(UCASE(LEFT(NEW.name, 1)), LCASE(SUBSTRING(NEW.name, 2, LOCATE(" ", NEW.name)-1))),
	                                  CONCAT(UCASE(SUBSTRING(NEW.name, LOCATE(" ", NEW.name)+1,1)), LCASE(SUBSTRING(NEW.name, (LOCATE(" ", NEW.name)+2), (LOCATE(" ", SUBSTRING_INDEX(SUBSTRING_INDEX(NEW.name, ' ', 3), ' ', -2))-1))),
                                      CONCAT(UCASE(LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(NEW.name, ' ', 3), ' ', -1),1)), LCASE(SUBSTRING(SUBSTRING_INDEX(SUBSTRING_INDEX(NEW.name, ' ', 3), ' ', -1),2))))));
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_event_switch`
--

DROP TABLE IF EXISTS `user_event_switch`;
CREATE TABLE `user_event_switch` (
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_editor` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `user_event_switch`
--

INSERT INTO `user_event_switch` (`user_id`, `event_id`, `date`, `is_editor`) VALUES
(3, 1, '2022-10-05 15:05:55', 1),
(3, 3, '2022-10-05 15:05:55', 1),
(21, 6, '2022-11-25 13:35:08', 1),
(19, 7, '2022-11-25 13:54:24', 1),
(1, 7, '2022-11-25 14:04:27', 0),
(20, 7, '2022-11-25 14:04:57', 0),
(21, 8, '2022-12-05 15:50:54', 1),
(21, 9, '2022-12-05 17:02:00', 1),
(21, 10, '2022-12-05 17:31:37', 1);

-- --------------------------------------------------------

--
-- Nézet szerkezete `comments`
--
DROP TABLE IF EXISTS `comments`;

DROP VIEW IF EXISTS `comments`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `comments`  AS   (select `u`.`name` AS `name`,`u`.`profile` AS `profile`,`c`.`text` AS `text`,`c`.`date` AS `date`,`c`.`user_id` AS `user_id`,`c`.`other_id` AS `other_id`,if(`c`.`type` = 0,'post','event') AS `location` from (((`comment` `c` left join `post` `p` on(`c`.`other_id` = `p`.`id`)) left join `event` `e` on(`c`.`other_id` = `e`.`id`)) left join `user` `u` on(`c`.`user_id` = `u`.`id`)))  ;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `friend`
--
ALTER TABLE `friend`
  ADD PRIMARY KEY (`id`),
  ADD KEY `friend_fk_1` (`src_user_id`),
  ADD KEY `friend_fk_2` (`dest_user_id`);

--
-- A tábla indexei `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_fk1` (`src_user_id`),
  ADD KEY `post_fk2` (`dest_user_id`);

--
-- A tábla indexei `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `user_event_switch`
--
ALTER TABLE `user_event_switch`
  ADD KEY `user_event_switch_fk1` (`user_id`),
  ADD KEY `user_event_switch_fk_1` (`event_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `event`
--
ALTER TABLE `event`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT a táblához `friend`
--
ALTER TABLE `friend`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT a táblához `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
