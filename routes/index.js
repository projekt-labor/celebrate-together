const bcrypt = require('bcrypt');
const express = require('express');
const INDEX_ROUTE = express.Router();
const DB = require("../src/database");  

const BASE_TITLE = "Celebrate Together";
const REGISTER_NOK = "Nem megfelelő regisztrációs adatok";
const LOGIN_NOK = "Nem megfelelő bejelentkezési adatok";
const ERROR_MSG = "Probléma lépett fel a kérés teljesítése során";


INDEX_ROUTE.get("/", async (req, res) => {
    res.render("index", {
        title: BASE_TITLE,
        messages: await req.consumeFlash('info')
    });
});

INDEX_ROUTE.get("/register", async (req, res) => {
    res.render("register", {
        title: BASE_TITLE,
        messages: await req.consumeFlash('info')
    });
});

INDEX_ROUTE.post("/register", async (req, res) => {
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
        req.flash('info', REGISTER_NOK);
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
            req.flash('info', ERROR_MSG);
            return res.redirect("/");
        }
        if (databaseResults.length != 0) {
            console.log("\nVan már ilyen email-el felhasználó!\n");
            req.flash('info', REGISTER_NOK);
            return res.redirect("/register");
        }
        return createAndSaveUser((error, result) => {
            if (error) {
                req.flash('info', ERROR_MSG);
                return res.redirect("/");
            }
            return res.redirect("/");
        });
    };

    return DB.query('SELECT u.email FROM users u WHERE u.email=?', [email], isTheEmailReserved);
});

INDEX_ROUTE.get("/login", async (req, res) => {
    res.render("login", {
        title: BASE_TITLE,
        messages: await req.consumeFlash('info')
    });
});

INDEX_ROUTE.post("/login", (req, res) => {
    req.checkBody("email", "The email field cannot be empty.")
        .isEmail()
        .isLength({ min: 1 });
    req.checkBody("password", "The password field cannot be empty.")
        .isLength({ min: 1 });

    const errors = req.validationErrors();
    const email = req.body.email;
    const password = req.body.password;
        
    if (errors) {
        req.flash('info', LOGIN_NOK);
        return res.redirect("/login");
    }

    const databaseResCallback = (error, databaseResults) => {
            if (error || !databaseResults || databaseResults.length == 0) {
                req.flash('info', LOGIN_NOK);
                return res.redirect("/login");
            }

            return bcrypt.compare(password, databaseResults[0].password, (error, isMatch) => {
                if (error) {
                    console.error(error);
                    req.flash('info', ERROR_MSG);
                    return res.redirect("/login");
                }
                if (!isMatch) {
                    req.flash('info', LOGIN_NOK);
                    return res.redirect("/login");
                }
                return res.redirect("/");
            });
            
    };
    return DB.query('SELECT u.email, u.password FROM users u WHERE u.email=?', [email], databaseResCallback);
});

module.exports = INDEX_ROUTE;
