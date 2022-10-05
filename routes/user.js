const bcrypt = require('bcrypt');
const express = require('express');
const USER_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");


USER_ROUTE.get("/user/:id", async (req, res) => {
    if (false && !req.session.user) {
        return res.redirect("/");
    }
    
    return res.render("user", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user,
        viewed_user: req.session.user
    });
});

module.exports = USER_ROUTE;
