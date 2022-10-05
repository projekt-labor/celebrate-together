const bcrypt = require('bcrypt');
const express = require('express');
const USER_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");


USER_ROUTE.get("/settings", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    
    return res.render("settings", {
        title: CONFIG.BASE_TITLE + " - Beállítások",
        messages: req.consumeFlash('info'),
        user: req.session.user
    });
});

USER_ROUTE.get("/:id", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    
    return res.render("user", {
        title: CONFIG.BASE_TITLE + " - Felhasználó",
        messages: req.consumeFlash('info'),
        user: req.session.user,
        viewed_user: req.session.user
    });
});

module.exports = USER_ROUTE;
