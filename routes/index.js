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
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        req.flash('info', "Nem megfelelő bejelentkezési adatok!");
        return res.redirect("/login");
    }

    DB.query('SELECT * FROM users WHERE email=?', [email], (error, databaseData, fields) => {
            if (error || !databaseData) {
                req.flash('info', "Nem megfelelő bejelentkezési adatok!");
                return res.redirect("/login");
            }
            
            return bcrypt.compare(password, databaseData.password, (err, result) => {
                /*
                if (!result) {
                    req.flash('info', "Nem megfelelő bejelentkezési adatok!");
                    return res.redirect("/login");
                }
                return res.redirect("/");
                */
            });
    });

    return res.redirect("/");
});

module.exports = INDEX_ROUTE;
