"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const USER_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined, isFriend } = require("../src/utils");


USER_ROUTE.get("/settings", onlyLogined, (req, res) => {
    return res.render("settings", {
        title: CONFIG.BASE_TITLE + " - Beállítások",
        messages: req.consumeFlash('info'),
        user: req.session.user
    });
});

USER_ROUTE.post("/settings", onlyLogined, (req, res) => {
    req.checkBody("name", "")
        .isLength({ min: 1 });
    req.checkBody("password", "")
        .isLength({ min: 1 });
    req.checkBody("birth_day", "")
        .isLength({ min: 4 });

    const errors = req.validationErrors();

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.ERROR_MSG);
        return res.redirect("/user/settings");
    }

    // 1. Jelszó ellenőrzés
    const databaseResCallback = (error, result) => {
        if (error || !result || result.length == 0) {
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/user/settings");
        }

        return bcrypt.compare(req.body.password, result[0].password, async (error, isMatch) => {
            if (error) {
                console.error(error);
                req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/user/settings");
            }
            if (!isMatch) {
                req.flash('info', "Nem megfelelő jelszó!");
                return res.redirect("/user/settings");
            }

            return await DB.query(
                "UPDATE user SET name=?, birth_day=?, birth_place=?, phone=?, residence=? WHERE id=?",
                [req.body.name, req.body.birth_day, req.body.birth_place, req.body.phone, req.body.residence, req.session.user.id],
                async (error, result) => {
                    if (error) {
                        console.error(error);
                        req.flash('info', CONFIG.ERROR_MSG);
                        return res.redirect("/user/settings");
                    }

                    req.session.user.name = req.body.name
                    req.session.user.birth_day = req.body.birth_day
                    req.session.user.birth_place = req.body.birth_place
                    req.session.user.phone = req.body.phone
                    req.session.user.residence = req.body.residence

                    console.log(req.body.name);
                    console.log(req.body.birth_day);
                    console.log(req.body.birth_place);
                    console.log(req.body.phone);
                    console.log(req.body.residence);

                    req.flash('info', "A változtatásokat sikeresen mentettük!");
                    return res.render("settings", {
                        title: CONFIG.BASE_TITLE + " - Beállítások",
                        messages: await req.consumeFlash('info'),
                        user: req.session.user
                    });
                }
            );
        });
    }

    return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.email=?`, [req.session.user.email], databaseResCallback);
});

USER_ROUTE.get("/:id/:name", onlyLogined, async (req, res) => {
    return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.id=?`, [req.params.id], async (errors, results) => {
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
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            view_user: user,
            // ????
            // ????
            // ????
            is_friend: DB.query("SELECT * FROM friend WHERE (src_user_id=? OR dest_user_id=?) OR (src_user_id=? OR dest_user_id=?)",
                [req.session.user.id, user.id, user.id, req.session.user.id],
                (error, result) => {
                    if (error) return 'na';
                    if (!result) return 'nr';
                    try {
                        return result[0].is_approved == 0 ? 'na' : 'a';
                    }
                    catch (e) {
                        return 'na';
                    }
                }
            )
        });
    });
});

USER_ROUTE.get("/friends", onlyLogined, async (req, res) => {
    let dbQuery = `SELECT * FROM ${CONFIG.FRIEND_TABLE_NAME} WHERE (src_user_id=? OR dest_user_id=?) AND is_approved=1`;
    return await DB.query(dbQuery, [req.session.user.id, req.session.user.id], async (errors, friends) => {
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
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            friends: friends
        });
    });
    
});

module.exports = USER_ROUTE;
