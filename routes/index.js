const bcrypt = require('bcrypt');
const express = require('express');
const INDEX_ROUTE = express.Router();
const DB = require("../src/database");  

const BASE_TITLE = "Celebrate Together";


INDEX_ROUTE.get("/", (req, res) => {
    const messages = req.consumeFlash('info');
    res.render("index", {
        title: BASE_TITLE,
        messages: messages
    });
});

/*
const myPlaintextPassword = "kecske";
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
            console.log(hash);
        });
    });
*/

INDEX_ROUTE.get("/login", async (req, res) => {
    const messages = await req.consumeFlash('info');

    res.render("login", {
        title: BASE_TITLE,
        messages: messages
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
        
    if (!email || !password || errors) {
        req.flash('info', "Nem megfelelő bejelentkezési adatok!");
        return res.redirect("/login");
    }

    const databaseResCallback = (error, databaseResults) => {
            if (error || !databaseResults || !databaseResults[0]) {
                req.flash('info', "Nem megfelelő bejelentkezési adatok!");
                return res.redirect("/login");
            }

            return bcrypt.compare(password, databaseResults[0].password, (error, isMatch) => {
                if (error) {
                    console.error(error);
                    req.flash('info', "Hiba a szerverrel!");
                    return res.redirect("/login");
                }
                if (!isMatch) {
                    req.flash('info', "Nem megfelelő bejelentkezési adatok!");
                    return res.redirect("/login");
                }
                return res.redirect("/");
            });
            
    };
    return DB.query('SELECT u.email, u.password FROM users u WHERE u.email=?', [email], databaseResCallback);
});

module.exports = INDEX_ROUTE;
