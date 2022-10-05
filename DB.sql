-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Gép: localhost
-- Létrehozás ideje: 2022. Okt 05. 21:21
-- Kiszolgáló verziója: 10.4.21-MariaDB
-- PHP verzió: 8.1.6

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

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `baratok`
--

CREATE TABLE `baratok` (
  `id` int(11) NOT NULL,
  `f_id` int(11) NOT NULL,
  `m_f_id` int(11) NOT NULL,
  `datum` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `baratok`
--

INSERT INTO `baratok` (`id`, `f_id`, `m_f_id`, `datum`) VALUES
(1, 1, 3, '2022-10-05 17:07:10'),
(2, 3, 4, '2022-10-05 17:07:10'),
(3, 4, 1, '2022-10-05 17:07:10');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `bejegyzes`
--

CREATE TABLE `bejegyzes` (
  `id` int(11) NOT NULL,
  `f_id` int(11) NOT NULL,
  `m_f_id` int(11) DEFAULT NULL,
  `datum` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `uzenet` text COLLATE utf8_hungarian_ci NOT NULL,
  `lathatosag` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `bejegyzes`
--

INSERT INTO `bejegyzes` (`id`, `f_id`, `m_f_id`, `datum`, `uzenet`, `lathatosag`) VALUES
(1, 1, 3, '2022-10-05 18:52:14', 'Helló', 0),
(2, 3, 1, '2022-10-05 16:38:02', 'Helló', 0),
(3, 3, NULL, '2022-10-05 18:53:17', 'Sziasztok', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `esemeny`
--

CREATE TABLE `esemeny` (
  `id` int(11) NOT NULL,
  `e_nev` varchar(50) COLLATE utf8_hungarian_ci NOT NULL,
  `szoveg` text COLLATE utf8_hungarian_ci NOT NULL,
  `hely` varchar(50) COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `esemeny`
--

INSERT INTO `esemeny` (`id`, `e_nev`, `szoveg`, `hely`) VALUES
(1, 'Elek Birthday party', 'asdaadssdasd', 'Nagykanizsa'),
(2, 'Party', 'asdasdasdas', 'Zalaegerszeg'),
(3, 'Party', 'asdasdasdads', 'Budapest');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `id` int(11) NOT NULL,
  `nev` varchar(30) COLLATE utf8_hungarian_ci NOT NULL,
  `email` varchar(128) COLLATE utf8_hungarian_ci NOT NULL,
  `jelszo` varchar(128) COLLATE utf8_hungarian_ci NOT NULL,
  `telefon` varchar(12) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `profilkep` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `szul_datum` date DEFAULT NULL,
  `szul_hely` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `lakhely` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `felhasznalok`
--

INSERT INTO `felhasznalok` (`id`, `nev`, `email`, `jelszo`, `telefon`, `profilkep`, `szul_datum`, `szul_hely`, `lakhely`) VALUES
(1, 'Remek Elek', 'kecske@gmail.com', '$2b$10$cKvUE49ScoZKyfgsk9ARWuWSJH74A9ry3abz4MC4HidLvmIEVC5uq', '06308218311', NULL, '2004-03-09', 'Budapest', 'Budapest'),
(3, 'Kasza Blanka', 'jelszó@gmail.com', '$2b$10$oXg1Sg56GG4uKLrpPBMilOK/fDad2N02uQiZP7H7zuDEHhFwApXta', '06301578984', NULL, '2004-03-10', 'Debrecen', 'Debrecen'),
(4, 'Kér Ede', 'asdasd@gmail.com', '$2b$10$BU90mYAR1jV/8U/BzQKu8uSSxeWMl/MaC1afHzSBiMuRFapRHYbna', '06301478526', NULL, '2005-10-11', 'Zalaegerszeg', 'Körmend');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `f_e_kapcsolo`
--

CREATE TABLE `f_e_kapcsolo` (
  `f_id` int(11) NOT NULL,
  `e_id` int(11) NOT NULL,
  `datum` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `f_e_kapcsolo`
--

INSERT INTO `f_e_kapcsolo` (`f_id`, `e_id`, `datum`) VALUES
(1, 2, '2022-10-05 17:04:46'),
(3, 1, '2022-10-05 17:05:55'),
(3, 3, '2022-10-05 17:05:55');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `baratok`
--
ALTER TABLE `baratok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `baratok_fk_1` (`f_id`),
  ADD KEY `baratok_fk_2` (`m_f_id`);

--
-- A tábla indexei `bejegyzes`
--
ALTER TABLE `bejegyzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bejegyzes_fk1` (`f_id`),
  ADD KEY `bejegyzes_fk2` (`m_f_id`);

--
-- A tábla indexei `esemeny`
--
ALTER TABLE `esemeny`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `f_e_kapcsolo`
--
ALTER TABLE `f_e_kapcsolo`
  ADD KEY `f_e_kapcsolo_fk1` (`f_id`),
  ADD KEY `f_e_kapcsolo_fk_1` (`e_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `baratok`
--
ALTER TABLE `baratok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `bejegyzes`
--
ALTER TABLE `bejegyzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `esemeny`
--
ALTER TABLE `esemeny`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `baratok`
--
ALTER TABLE `baratok`
  ADD CONSTRAINT `baratok_fk_1` FOREIGN KEY (`F_ID`) REFERENCES `felhasznalok` (`id`),
  ADD CONSTRAINT `baratok_fk_2` FOREIGN KEY (`m_f_id`) REFERENCES `felhasznalok` (`id`);

--
-- Megkötések a táblához `bejegyzes`
--
ALTER TABLE `bejegyzes`
  ADD CONSTRAINT `bejegyzes_fk1` FOREIGN KEY (`F_ID`) REFERENCES `felhasznalok` (`id`),
  ADD CONSTRAINT `bejegyzes_fk2` FOREIGN KEY (`m_f_id`) REFERENCES `felhasznalok` (`id`);

--
-- Megkötések a táblához `f_e_kapcsolo`
--
ALTER TABLE `f_e_kapcsolo`
  ADD CONSTRAINT `f_e_kapcsolo_fk1` FOREIGN KEY (`F_ID`) REFERENCES `felhasznalok` (`id`),
  ADD CONSTRAINT `f_e_kapcsolo_fk_1` FOREIGN KEY (`E_ID`) REFERENCES `esemeny` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
