-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2022. Dec 10. 08:20
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
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `other_id` int(11) NOT NULL,
  `type` tinyint(1) DEFAULT NULL COMMENT 'T/F',
  `text` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `comment`
--


-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `comments`
-- (Lásd alább az aktuális nézetet)
--
DROP VIEW IF EXISTS `comments`;
CREATE TABLE `comments` (
`name` varchar(30)
,`profile` varchar(50)
,`c_id` int(11)
,`user_id` int(11)
,`other_id` int(11)
,`location` varchar(5)
,`text` varchar(40)
,`date` timestamp
,`L` int(11)
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



--
-- Eseményindítók `event`
--
DROP TRIGGER IF EXISTS `delete_event`;
DELIMITER $$
CREATE TRIGGER `delete_event` BEFORE DELETE ON `event` FOR EACH ROW BEGIN
    DELETE from comment where comment.other_id = OLD.id;
END
$$
DELIMITER ;

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


--
-- Eseményindítók `post`
--
DROP TRIGGER IF EXISTS `delete_post`;
DELIMITER $$
CREATE TRIGGER `delete_post` BEFORE DELETE ON `post` FOR EACH ROW BEGIN
    DELETE from comment where comment.other_id = OLD.id;
END
$$
DELIMITER ;

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
  `residence` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `admin` TINYINT(1) NOT NULL , 
  `email_conf` TINYINT(1) NOT NULL , 
  `email_code` INT(6) NULL , 
  `pass_code` INT(6) NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;


-- CREATE TABLE `test`.`asd` (`admin` BIT(1) NOT NULL , `emailmegerosites` BIT(1) NOT NULL , `emailkod` INT(6) NOT NULL , `jelszokod` INT(6) NULL DEFAULT NULL 
--
-- A tábla adatainak kiíratása `user`
--


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
       SET NEW.name = (SELECT CONCAT(CONCAT(UCASE(LEFT(NEW.name, 1)), 
       LCASE(SUBSTRING(NEW.name, 2, LOCATE(" ", NEW.name)-1))),
	               CONCAT(UCASE(SUBSTRING(NEW.name, LOCATE(" ", NEW.name)+1,1)), 
                 LCASE(SUBSTRING(NEW.name, (LOCATE(" ", NEW.name)+2))))));
    ELSE
        SET NEW.name = (SELECT CONCAT(CONCAT(UCASE(LEFT(NEW.name, 1)), 
        LCASE(SUBSTRING(NEW.name, 2, LOCATE(" ", NEW.name)-1))),
	                                  CONCAT(UCASE(SUBSTRING(NEW.name, LOCATE(" ", NEW.name)+1,1)), 
                                    LCASE(SUBSTRING(NEW.name, (LOCATE(" ", NEW.name)+2), 
                                    (LOCATE(" ", SUBSTRING_INDEX(SUBSTRING_INDEX(NEW.name, ' ', 3), ' ', -2))-1))),
                                      CONCAT(UCASE(LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(NEW.name, ' ', 3), ' ', -1),1)), 
                                      LCASE(SUBSTRING(SUBSTRING_INDEX(SUBSTRING_INDEX(NEW.name, ' ', 3), ' ', -1),2))))));
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


-- --------------------------------------------------------

--
-- Nézet szerkezete `comments`
--
DROP TABLE IF EXISTS `comments`;

DROP VIEW IF EXISTS `comments`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `comments`  AS SELECT `u`.`name` AS `name`, `u`.`profile` AS `profile`, `c`.`id` AS `c_id`, `c`.`user_id` AS `user_id`, `c`.`other_id` AS `other_id`, if(`c`.`type` = 0,'post','event') AS `location`, `c`.`text` AS `text`, `c`.`date` AS `date`, CASE WHEN `c`.`type` = 0 THEN `p`.`id` WHEN `c`.`type` <> 0 THEN `e`.`id` END AS `L` FROM (((`comment` `c` left join `post` `p` on(`c`.`other_id` = `p`.`id`)) left join `event` `e` on(`c`.`other_id` = `e`.`id`)) left join `user` `u` on(`c`.`user_id` = `u`.`id`)) ;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT a táblához `comment`
--
ALTER TABLE `comment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT a táblához `event`
--
ALTER TABLE `event`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT a táblához `friend`
--
ALTER TABLE `friend`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT a táblához `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
