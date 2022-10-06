"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const USER_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");


USER_ROUTE.get("/settings", onlyLogined, (req, res) => {
    return res.render("settings", {
        title: CONFIG.BASE_TITLE + " - Beállítások",
        messages: req.consumeFlash('info'),
        user: req.session.user
    });
});

USER_ROUTE.get("/:id/:name", onlyLogined, (req, res) => {
    return res.render("user", {
        title: CONFIG.BASE_TITLE + " - Felhasználó",
        messages: req.consumeFlash('info'),
        user: req.session.user,
        viewed_user: req.session.user
    });
});

module.exports = USER_ROUTE;
