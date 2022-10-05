const bcrypt = require('bcrypt');
const express = require('express');
const INDEX_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");


INDEX_ROUTE.get("/", async (req, res) => {
    return res.render("index", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.get("/register", async (req, res) => {
    
    // Átiránítás ha be van jelentkezve
    if (req.session.user) {
        return res.redirect("/");
    }

    return res.render("register", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.get("/logout", async (req, res) => {
    // Átiránítás ha nincs bejelentkezve
    if (!req.session.user) {
        return res.redirect("/");
    }

    req.session.user = null;
    return res.redirect("/");
});

INDEX_ROUTE.post("/logout", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }

    req.session.user = null;
    return res.redirect("/");
});

INDEX_ROUTE.post("/register", async (req, res) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    
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
        return res.redirect("/");
    }

    if (password != passwordAgain) {
        req.flash('info', "A megadott jelszavak nem egyeznek!");
        return res.redirect("/register");
    }

    // 2. Felhasználó létrehozása
    const createAndSaveUser = (callback) => {
        return bcrypt.genSalt(10, (err, salt) => {
            return bcrypt.hash(password, salt, function(err, hash) {
                const q = `INSERT INTO ${CONFIG.USERS_TABLE_NAME} (nev, email, jelszo, szul_datum) VALUES (?, ?, ?, ?)`;
                return DB.query(q, [name, email, hash, birthday], callback);
            });
        });
    }

    // 1. Keressük hogy az email foglalt-e?
    const isTheEmailReserved = (error, databaseResults) => {
        if (error) {
            console.log(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
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
                return res.redirect("/");
            }

            // SIKERES REGISZTRÁCIÓ
            req.session.user = new User().fromDB(databaseResults2[0]);
            return res.redirect("/");
        });
    };

    return DB.query(`SELECT u.email FROM ${CONFIG.USERS_TABLE_NAME} u WHERE u.email=?`, [email], isTheEmailReserved);
});

INDEX_ROUTE.get("/login", async (req, res) => {
    if (req.session.user) {
        return res.redirect("/");
    }

    res.render("login", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.post("/login", (req, res) => {
    if (req.session.user) {
        return res.redirect("/");
    }

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
            if (error || !databaseResults || databaseResults.length == 0) {
                req.flash('info', CONFIG.LOGIN_NOK);
                return res.redirect("/login");
            }

            // 2. Jelszó ellenőrzése
            return bcrypt.compare(password, databaseResults[0].jelszo, (error, isMatch) => {
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
                return res.redirect("/");
            });
            
    };
    return DB.query(`SELECT u.email, u.jelszo FROM ${CONFIG.USERS_TABLE_NAME} u WHERE u.email=?`, [email], databaseResCallback);
});

module.exports = INDEX_ROUTE;
