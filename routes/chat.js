"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const CHAT_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");


CHAT_ROUTE.get("/", onlyLogined, (req, res) => {    
    //return DB.query("SELECT * FROM user u LEFT JOIN post p ON(p.src_user_id=u.id AND p.dest_user_id=u.id) WHERE p.is_public=0 AND (p.src_user_id=? OR p.dest_user_id=?)",
    return DB.query("SELECT * FROM friend WHERE (src_user_id=? OR dest_user_id=?) AND is_approved=1",
    [req.session.user.id, req.session.user.id],
    (errors, friends) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/chat");
        }

        if (friends.length == 0) {
            friends = false;
        }

        return res.render("chat", {
            title: CONFIG.BASE_TITLE + " - Chat",
            messages: req.consumeFlash('info'),
            user: req.session.user,
            friends: friends
        });
    });
});

CHAT_ROUTE.get("/:user_id", onlyLogined, (req, res) => {    
    return res.render("chat", {
        title: CONFIG.BASE_TITLE + " - Chat",
        messages: req.consumeFlash('info'),
        user: req.session.user,
    });
});

module.exports = CHAT_ROUTE;
