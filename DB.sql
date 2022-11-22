-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2022. Nov 12. 18:20
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

DROP TABLE IF EXISTS `post`;
DROP TABLE IF EXISTS `friend`;
DROP TABLE IF EXISTS `user_event_switch`;
DROP TABLE IF EXISTS `event`;
DROP TABLE IF EXISTS `user`;

--
-- Tábla szerkezet ehhez a táblához `event`
--

CREATE TABLE `event` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_hungarian_ci NOT NULL,
  `text` text COLLATE utf8_hungarian_ci NOT NULL,
  `place` varchar(50) COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `event`
--

INSERT INTO `event` (`id`, `name`, `text`, `place`) VALUES
(1, 'Elek Birthday party', 'asdaadssdasd', 'Nagykanizsa'),
(2, 'Party', 'asdasdasdas', 'Zalaegerszeg'),
(3, 'Party', 'asdasdasdads', 'Budapest');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `friend`
--

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
(1, 1, 3, 0, '2022-10-05 17:07:10'),
(2, 3, 4, 1, '2022-10-14 13:35:11'),
(5, 4, 7, 1, '2022-10-14 13:27:04'),
(6, 7, 3, 1, '2022-10-14 14:16:56');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `post`
--
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
(1, 4, 7, '2022-10-14 13:58:51', 'Helló', 0),
(2, 7, 4, '2022-10-14 14:04:48', 'Helló Ede!', 0),
(3, 3, NULL, '2022-10-05 18:53:17', 'Sziasztok', 1),
(4, 7, 4, '2022-10-14 14:27:07', 'Teszt üzenet', 0),
(5, 7, 4, '2022-10-14 14:31:47', 'ez még egy teszt', 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user`
--

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
-- Mindenkinek alapból a jelszava asdasd
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `profile`, `birth_day`, `birth_place`, `residence`) VALUES
(1, 'Remek Elek', 'kecske@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', '06308218311', 'avatar1.png', '2004-03-09', 'Budapest', 'Budapest'),
(3, 'Kasza Blanka', 'jelszó@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', '06301578984', 'avatar1.png', '2004-03-10', 'Debrecen', 'Debrecen'),
(4, 'Kér Ede', 'asdasd@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', '06301478526', 'avatar1.png', '2005-10-11', 'Zalaegerszeg', 'Körmend'),
(19, 'Zsíros B. Ödön', 'zsirosb.odon@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', NULL, 'avatar1.png', '2010-06-23', NULL, NULL),
(20, 'Kukor Ica', 'kukor.ica@gmail.com', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', NULL, 'avatar1.png', '2015-05-21', NULL, NULL),
(21, 'Teszt Felhasználó', 'teszt@teszt.teszt', '$2b$10$ZKE.QYBBo1ekICbR2RvJs.OWXs/wsUUxfFP2S0jZ2.JZCw5UZ29C6', NULL, 'avatar1.png', '1995-02-27', NULL, NULL);

--
-- Eseményindítók `user`
--
DELIMITER $$
CREATE TRIGGER `delete_users` BEFORE DELETE ON `user` FOR EACH ROW BEGIN
	DELETE from user_event_switch where user_id = OLD.id;
    DELETE from friend where src_user_id = OLD.id or dest_user_id = OLD.id;
    DELETE from post where src_user_id = OLD.id or dest_user_id = OLD.id;
END
$$
DELIMITER ;
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
(1, 2, '2022-10-05 17:04:46', 1),
(3, 1, '2022-10-05 17:05:55', 1),
(3, 3, '2022-10-05 17:05:55', 1);

-- comment
-- tipusok: event, post
CREATE TABLE `comment` (
  `user_id` int(11) NOT NULL,
  `other_id` int(11) NOT NULL,
  `type` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `text` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `friend`
--
ALTER TABLE `friend`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `friend`
--
ALTER TABLE `friend`
  ADD CONSTRAINT `friend_fk_1` FOREIGN KEY (`src_user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `friend_fk_2` FOREIGN KEY (`dest_user_id`) REFERENCES `user` (`id`);

--
-- Megkötések a táblához `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `post_fk1` FOREIGN KEY (`src_user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `post_fk2` FOREIGN KEY (`dest_user_id`) REFERENCES `user` (`id`);

--
-- Megkötések a táblához `user_event_switch`
--
ALTER TABLE `user_event_switch`
  ADD CONSTRAINT `user_event_switch_fk1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `user_event_switch_fk_1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;