"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const SEARCH_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");


SEARCH_ROUTE.get("/search", onlyLogined, (req, res) => {    
    return res.render("search", {
        title: CONFIG.BASE_TITLE + " - Keresés",
        messages: req.consumeFlash('info'),
        user: req.session.user
    });
});

SEARCH_ROUTE.post("/search", onlyLogined, (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    
    result_columns = [
        "id", "email", "nev", "jelszo", "szul_datum", "szul_hely"
    ]

    // ...

    return res.render("search", {
        title: CONFIG.BASE_TITLE + " - Keresés",
        messages: req.consumeFlash('info'),
        user: req.session.user,
        result_columns: result_columns,
        result: results
    });
});

module.exports = SEARCH_ROUTE;
