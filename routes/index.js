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

    req.checkBody("email", "The email field cannot be empty.")
        .isEmail()
        .isLength({ min: 1 });
    req.checkBody("password", "The password field cannot be empty.")
        .isLength({ min: 1 });
    req.checkBody("password_again", "The password again field cannot be empty.")
        .isLength({ min: 1 });
    req.checkBody("birthday", "The birthday field cannot be empty.")
        .isLength({ min: 4 });

    const errors = req.validationErrors();
    const email = req.body.email;
    const password = req.body.password;
    const passwordAgain = req.body.password_again;
    const birthday = req.body.birthday;

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
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
                return DB.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash], callback);
            });
        });
    }

    // 1. Keressük hogy az email foglalt-e?
    const isTheEmailReserved = (error, databaseResults) => {
        if (error) {
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }
        if (databaseResults.length != 0) {
            console.log("\nVan már ilyen email-el felhasználó!\n");
            req.flash('info', CONFIG.REGISTER_NOK);
            return res.redirect("/register");
        }
        return createAndSaveUser((error, result) => {
            if (error) {
                req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/");
            }

            // SIKERES REGISZTRÁCIÓ
            req.session.user = new User(email, password);
            return res.redirect("/");
        });
    };

    return DB.query('SELECT u.email FROM users u WHERE u.email=?', [email], isTheEmailReserved);
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

    req.checkBody("email", "The email field cannot be empty.")
        .isEmail()
        .isLength({ min: 1 });
    req.checkBody("password", "The password field cannot be empty.")
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
                req.session.user = new User(dbu.email, dbu.password);
                return res.redirect("/");
            });
            
    };
    return DB.query('SELECT u.email, u.password FROM users u WHERE u.email=?', [email], databaseResCallback);
});

module.exports = INDEX_ROUTE;
