"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const INDEX_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");


INDEX_ROUTE.get("/", async (req, res) => {
    return res.render("index", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.get("/register", onlyNotLogined, async (req, res) => {
    return res.render("register", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.post("/settings", onlyLogined, (req, res) => {
    return res.redirect("/user/settings");
});

INDEX_ROUTE.get("/logout", onlyLogined, async (req, res) => {
    req.session.user = null;
    return res.redirect("/");
});

INDEX_ROUTE.post("/logout", onlyLogined, async (req, res) => {
    req.session.user = null;
    return res.redirect("/");
});

INDEX_ROUTE.post("/register", onlyNotLogined, async (req, res) => {    
    req.checkBody("name", "")
        .isLength({ min: 1 });
    req.checkBody("email", "")
        .isEmail()
        .isLength({ min: 1 });
    req.checkBody("password", "")
        .isLength({ min: 1 });
    req.checkBody("password_again", "")
        .isLength({ min: 1 });
    req.checkBody("birthday", "")
        .isLength({ min: 4 });

    const errors = req.validationErrors();
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const passwordAgain = req.body.password_again;
    const birthday = req.body.birthday;

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.REGISTER_NOK);
        return res.redirect("/register");
    }

    if (password != passwordAgain) {
        req.flash('info', "A megadott jelszavak nem egyeznek!");
        return res.redirect("/register");
    }

    // 3. Felhasználó beléptetése
    const getAndLogInUser = (error, result) => {
        if (error) {
            console.log(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/register");
        }

        // SIKERES REGISZTRÁCIÓ
        req.session.user = new User().fromDB(result[0]);
        return res.redirect("/");
    };

    // 2. Felhasználó létrehozása
    const createAndSaveUser = (callback) => {
        return bcrypt.genSalt(10, (err, salt) => {
            return bcrypt.hash(password, salt, function(err, hash) {
                const q = `INSERT INTO ${CONFIG.USER_TABLE_NAME} (name, email, password, birth_day) VALUES (?, ?, ?, ?)`;
                return DB.query(q, [name, email, hash, birthday], callback);
            });
        });
    };

    // 1. Keressük hogy az email foglalt-e?
    const isTheEmailReserved = (error, databaseResults) => {
        if (error) {
            console.log(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/register");
        }
        if (databaseResults.length != 0) {
            console.log("\nVan már ilyen email-el felhasználó!\n");
            req.flash('info', CONFIG.REGISTER_NOK);
            return res.redirect("/register");
        }
        return createAndSaveUser((error, databaseResults2) => {
            if (error) {
                console.log(error);
                req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/register");
            }
            return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.email=?`, [email], getAndLogInUser)
        });
    };

    return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.email=?`, [email], isTheEmailReserved);
});

INDEX_ROUTE.get("/login", onlyNotLogined, async (req, res) => {
    res.render("login", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.post("/login", onlyNotLogined, (req, res) => {
    req.checkBody("email", "")
        .isEmail()
        .isLength({ min: 1 });
    req.checkBody("password", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();
    const email = req.body.email;
    const password = req.body.password;
        
    if (errors) {
        req.flash('info', CONFIG.LOGIN_NOK);
        return res.redirect("/login");
    }

    // 1. Adatok lekérése az adatbázisból
    const databaseResCallback = (error, databaseResults) => {
            console.log(error, databaseResults);

            if (error || !databaseResults || databaseResults.length == 0) {
                req.flash('info', CONFIG.LOGIN_NOK);
                return res.redirect("/login");
            }

            // 2. Jelszó ellenőrzése
            return bcrypt.compare(password, databaseResults[0].password, (error, isMatch) => {
                if (error) {
                    console.error(error);
                    req.flash('info', CONFIG.ERROR_MSG);
                    return res.redirect("/login");
                }
                if (!isMatch) {
                    req.flash('info', CONFIG.LOGIN_NOK);
                    return res.redirect("/login");
                }

                // SIKERES BEJELENTKEZÉS
                let dbu = databaseResults[0];
                req.session.user = new User().fromDB(dbu);
                console.log("Login:");
                console.log(req.session.user);
                console.log(dbu);
                return res.redirect("/");
            });
            
    };
    return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.email=?`, [email], databaseResCallback);
});

INDEX_ROUTE.get("/terms", async (req, res) => {
    return res.render("terms", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.get("/contact", async (req, res) => {
    return res.render("contact", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

module.exports = INDEX_ROUTE;
