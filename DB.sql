-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2022. Okt 05. 20:56
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
-- Adatbázis: `celebrate`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `baratok`
--

CREATE TABLE `baratok` (
  `ID` int(11) NOT NULL,
  `F_ID` int(11) NOT NULL,
  `MF_ID` int(11) NOT NULL,
  `Datum` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `baratok`
--

INSERT INTO `baratok` (`ID`, `F_ID`, `MF_ID`, `Datum`) VALUES
(1, 1, 3, '2022-10-05 17:07:10'),
(2, 3, 4, '2022-10-05 17:07:10'),
(3, 4, 1, '2022-10-05 17:07:10');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `bejegyzes`
--

CREATE TABLE `bejegyzes` (
  `ID` int(11) NOT NULL,
  `F_ID` int(11) NOT NULL,
  `MF_ID` int(11) DEFAULT NULL,
  `Datum` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Uzenet` text COLLATE utf8_hungarian_ci NOT NULL,
  `Lathatosag` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `bejegyzes`
--

INSERT INTO `bejegyzes` (`ID`, `F_ID`, `MF_ID`, `Datum`, `Uzenet`, `Lathatosag`) VALUES
(1, 1, 3, '2022-10-05 18:52:14', 'Helló', 0),
(2, 3, 1, '2022-10-05 16:38:02', 'Helló', 0),
(3, 3, NULL, '2022-10-05 18:53:17', 'Sziasztok', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `esemeny`
--

CREATE TABLE `esemeny` (
  `ID` int(11) NOT NULL,
  `E_Nev` varchar(50) COLLATE utf8_hungarian_ci NOT NULL,
  `Szoveg` text COLLATE utf8_hungarian_ci NOT NULL,
  `Hely` varchar(50) COLLATE utf8_hungarian_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `esemeny`
--

INSERT INTO `esemeny` (`ID`, `E_Nev`, `Szoveg`, `Hely`) VALUES
(1, 'Elek Birthday party', 'asdaadssdasd', 'Nagykanizsa'),
(2, 'Party', 'asdasdasdas', 'Zalaegerszeg'),
(3, 'Party', 'asdasdasdads', 'Budapest');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `f_e_kapcsolo`
--

CREATE TABLE `f_e_kapcsolo` (
  `F_ID` int(11) NOT NULL,
  `E_ID` int(11) NOT NULL,
  `Datum` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `f_e_kapcsolo`
--

INSERT INTO `f_e_kapcsolo` (`F_ID`, `E_ID`, `Datum`) VALUES
(1, 2, '2022-10-05 17:04:46'),
(3, 1, '2022-10-05 17:05:55'),
(3, 3, '2022-10-05 17:05:55');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `Nev` varchar(30) COLLATE utf8_hungarian_ci NOT NULL,
  `email` varchar(128) COLLATE utf8_hungarian_ci NOT NULL,
  `password` varchar(128) COLLATE utf8_hungarian_ci NOT NULL,
  `Telefon` varchar(12) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `Profilkep` varchar(50) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `Szul_Datum` date DEFAULT NULL,
  `Szul_hely` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL,
  `Lakhely` varchar(40) COLLATE utf8_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `Nev`, `email`, `password`, `Telefon`, `Profilkep`, `Szul_Datum`, `Szul_hely`, `Lakhely`) VALUES
(1, 'Remek Elek', 'kecske@gmail.com', '$2b$10$cKvUE49ScoZKyfgsk9ARWuWSJH74A9ry3abz4MC4HidLvmIEVC5uq', '06308218311', NULL, '2004-03-09', 'Budapest', 'Budapest'),
(3, 'Kasza Blanka', 'jelszó@gmail.com', '$2b$10$oXg1Sg56GG4uKLrpPBMilOK/fDad2N02uQiZP7H7zuDEHhFwApXta', '06301578984', NULL, '2004-03-10', 'Debrecen', 'Debrecen'),
(4, 'Kér Ede', 'asdasd@gmail.com', '$2b$10$BU90mYAR1jV/8U/BzQKu8uSSxeWMl/MaC1afHzSBiMuRFapRHYbna', '06301478526', NULL, '2005-10-11', 'Zalaegerszeg', 'Körmend');
-- FONTOS: Jelszavak sorrendben: kecske, jelszó, asdasd
--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `baratok`
--
ALTER TABLE `baratok`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `baratok_fk_1` (`F_ID`),
  ADD KEY `baratok_fk_2` (`MF_ID`);

--
-- A tábla indexei `bejegyzes`
--
ALTER TABLE `bejegyzes`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `bejegyzes_fk1` (`F_ID`),
  ADD KEY `bejegyzes_fk2` (`MF_ID`);

--
-- A tábla indexei `esemeny`
--
ALTER TABLE `esemeny`
  ADD PRIMARY KEY (`ID`);

--
-- A tábla indexei `f_e_kapcsolo`
--
ALTER TABLE `f_e_kapcsolo`
  ADD KEY `f_e_kapcsolo_fk1` (`F_ID`),
  ADD KEY `f_e_kapcsolo_fk_1` (`E_ID`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `baratok`
--
ALTER TABLE `baratok`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `bejegyzes`
--
ALTER TABLE `bejegyzes`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `esemeny`
--
ALTER TABLE `esemeny`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `baratok`
--
ALTER TABLE `baratok`
  ADD CONSTRAINT `baratok_fk_1` FOREIGN KEY (`F_ID`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `baratok_fk_2` FOREIGN KEY (`MF_ID`) REFERENCES `users` (`id`);

--
-- Megkötések a táblához `bejegyzes`
--
ALTER TABLE `bejegyzes`
  ADD CONSTRAINT `bejegyzes_fk1` FOREIGN KEY (`F_ID`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bejegyzes_fk2` FOREIGN KEY (`MF_ID`) REFERENCES `users` (`id`);

--
-- Megkötések a táblához `f_e_kapcsolo`
--
ALTER TABLE `f_e_kapcsolo`
  ADD CONSTRAINT `f_e_kapcsolo_fk1` FOREIGN KEY (`F_ID`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `f_e_kapcsolo_fk_1` FOREIGN KEY (`E_ID`) REFERENCES `esemeny` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
