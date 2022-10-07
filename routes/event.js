"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const EVENT_ROUTE = express.Router();
const DB = require("../src/database");
const Event = require("../models/event");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");


EVENT_ROUTE.get("/:id/:name", onlyLogined, (req, res) => {
    return DB.query(`SELECT * FROM ${CONFIG.EVENT_TABLE_NAME} e WHERE e.id=?`, [req.params.id], (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        if (results.length == 0) {
            req.flash('info', CONFIG.EVENT_NOT_FOUND);
            return res.redirect("/");
        }

        let e = new Event().fromDB(results[0]);
        return res.render("event", {
            title: CONFIG.BASE_TITLE + " - " + e.name,
            messages: req.consumeFlash('info'),
            user: req.session.user,
            event: e
        });
    });
});

module.exports = EVENT_ROUTE;