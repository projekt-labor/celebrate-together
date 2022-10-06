"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const SEARCH_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
//const Event = require("../models/event");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");


SEARCH_ROUTE.get("/search", onlyLogined, (req, res) => {    
    return res.render("search", {
        title: CONFIG.BASE_TITLE + " - Keresés",
        messages: req.consumeFlash('info'),
        user: req.session.user
    });
});

SEARCH_ROUTE.post("/search/event", onlyLogined, (req, res) => {
    req.checkBody("q_event", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();
    const q_event = req.body.q_event;

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.REGISTER_NOK);
        return res.redirect("/search");
    }

    const callback = (error, databaseResults) => {
        if (error) {
            console.log(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/search");
        }

        return res.render("search", {
            title: CONFIG.BASE_TITLE + " - Keresés",
            messages: req.consumeFlash('info'),
            user: req.session.user,
            results: databaseResults,
            result_type: "event"
        });
    }

    return DB.query("SELECT * FROM " + CONFIG.EVENT_TABLE_NAME + " WHERE name LIKE ?", ["%"+q_event+"%"], callback);
});

SEARCH_ROUTE.post("/search/user", onlyLogined, (req, res) => {
    req.checkBody("q_user", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();
    const q_user = req.body.q_user;

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.REGISTER_NOK);
        return res.redirect("/search");
    }

    const callback = (error, databaseResults) => {
        if (error) {
            console.log(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/search");
        }

        return res.render("search", {
            title: CONFIG.BASE_TITLE + " - Keresés",
            messages: req.consumeFlash('info'),
            user: req.session.user,
            results: databaseResults,
            result_type: "user"
        });
    }

    return DB.query("SELECT * FROM " + CONFIG.USER_TABLE_NAME + " WHERE name LIKE ?", ["%"+q_user+"%"], callback);
});

module.exports = SEARCH_ROUTE;
