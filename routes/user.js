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
    return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.id=?`, [req.params.id], (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        if (results.length == 0) {
            req.flash('info', CONFIG.USER_NOT_FOUND);
            return res.redirect("/");
        }

        let user = new User().fromDB(results[0]);
        return res.render("user", {
            title: CONFIG.BASE_TITLE + " - " + user.name,
            messages: req.consumeFlash('info'),
            user: req.session.user,
            view_user: user
        });
    });
});

USER_ROUTE.get("/friends", onlyLogined, (req, res) => {
    let dbQuery = `SELECT * FROM ${CONFIG.FRIEND_TABLE_NAME} WHERE (src_user_id=? OR dest_user_id=?) AND is_approved=1`;
    return DB.query(dbQuery, [req.session.user.id, req.session.user.id], (errors, friends) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        if (friends.length == 0) {
            friends = false;
        }

        return res.render("friends", {
            title: CONFIG.BASE_TITLE + " - " + "Barátok",
            messages: req.consumeFlash('info'),
            user: req.session.user,
            friends: friends
        });
    });
    
});

module.exports = USER_ROUTE;
