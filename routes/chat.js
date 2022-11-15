"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const CHAT_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");


let LAST_CHAT_UPDATE = 0;


CHAT_ROUTE.get("/:id", onlyLogined, (req, res) => {

    function getMsgs(errors, self_messages) {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        //console.log(self_messages);

        return DB.query("SELECT * FROM `post` p WHERE p.is_public=0 AND p.src_user_id=? AND p.dest_user_id=? ORDER BY date",
        [req.params.id, req.session.user.id],
        (errors, other_messages) => {
            if (errors) {
                console.log(errors);
                req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/");
            }

            //console.log(other_messages);

            return DB.query("SELECT * FROM `user` u WHERE u.id=?",
            [req.params.id],
            (errors, other_user) => {
                if (errors || other_user.length==0) {
                    console.log(errors);
                    req.flash('info', CONFIG.ERROR_MSG);
                    return res.redirect("/");
                }

                //console.log(other_user);

                return res.render("chat", {
                    title: CONFIG.BASE_TITLE + " - Chat",
                    messages: req.consumeFlash('info'),
                    user: req.session.user,
                    chat_messages: ([...self_messages, ...other_messages])
                        .sort((a, b) => a.date - b.date),
                    other_user: new User().fromDB(other_user[0])
                });
            });
        });
    }

    // Are they friends?
    return DB.query("SELECT * FROM friend f WHERE ((f.src_user_id=? AND f.dest_user_id=?) OR (f.src_user_id=? AND f.dest_user_id=?)) AND f.is_approved=1", 
    [req.session.user.id, req.params.id, req.params.id, req.session.user.id],
    (errors, result) => {
        if (errors || result.length==0) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        return DB.query("SELECT * FROM `post` p WHERE p.is_public=0 AND p.src_user_id=? AND p.dest_user_id=? ORDER BY date ASC",
        [req.session.user.id, req.params.id], getMsgs);
    });
});

CHAT_ROUTE.post("/:id/send", onlyLogined, (req, res) => {
    req.checkBody("message", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        req.flash('info', CONFIG.WRTIE_SOMETHING_AS_MESSAGE);
        return res.redirect("/chat/" + req.params.id);
    }

    return DB.query("INSERT INTO `post` (src_user_id, dest_user_id, date, message, is_public) VALUES (?, ?, ?, ?, ?)",
    [req.session.user.id, req.params.id, new Date(), req.body.message, 0],
    (errors, result) => {
        if (errors) {
            req.flash('info', CONFIG.ERROR_MSG);
        }
        return res.redirect("/chat/" + req.params.id);
    });
});

CHAT_ROUTE.post("/:id/:time/api", onlyLogined, (req, res) => {
    
    //console.log(req.params.id);
    //console.log(req.params.time);

    // If one of them is not number
    if (isNaN(req.params.time) || isNaN(req.params.id)) {
        return res.json({
            status: 0,
            reason: "NaN"
        });
    }

    return DB.query("SELECT * FROM `post` p WHERE p.is_public=0 AND ((p.src_user_id=? AND p.dest_user_id=?) OR p.src_user_id=? AND p.dest_user_id=?) ORDER BY date",
        [req.params.id, req.session.user.id, req.session.user.id, req.params.id],
        (errors, results) => {
            if (errors || results.length == 0) {
                console.log(errors);
                return res.json({
                    status: 0,
                    reason: errors
                });
            }
            let lcu = LAST_CHAT_UPDATE;
            LAST_CHAT_UPDATE = req.params.time;
            return res.json({
                status: 1,
                /*
                messages: results.filter((r) => {
                    if (lcu !== 0) {
                        return r.date.getTime() > lcu;
                    }
                    else {
                        return false;
                    }
                })
                */
               messages: results
            });
        });
    
});

CHAT_ROUTE.post("/:userid/public_post", onlyLogined, async (req, res) => {
    req.checkBody("text", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();
    
    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        await req.flash('info', CONFIG.ERROR_MSG);
        return res.redirect("/");
    }

    return await DB.query(
        `INSERT INTO post (src_user_id, dest_user_id, date, message, is_public) VALUES
        (?, NULL, ?, ?, 1);`,
        [req.params.userid, new Date(), req.body.text],
        async (err, result) => {
            if (err) {
                await req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/");
            } 
            req.flash('info', "A posztot sikeresen elmentettük!");
            return res.redirect("/");
        }
    )
});

CHAT_ROUTE.get("/:postid/delete", onlyLogined, async (req, res) => {
    return await DB.query(
        `SELECT * FROM post WHERE (src_user_id=? AND id=?);`,
        [req.session.user.id, req.params.postid],
        async (err, results) => {
            if (err || !results) {
                await req.flash('info', CONFIG.ERROR_MSG+" 1");
                console.log(err);
                return res.redirect("/");
            }
            if (results[0].src_user_id != req.session.user.id) {
                await req.flash('info', CONFIG.ERROR_MSG+" 2");
                console.log("not maching users");
                return res.redirect("/");
            }
            return await DB.query(
                `DELETE FROM post WHERE (src_user_id=? AND id=?)`,
                [req.session.user.id, req.params.postid],
                async (err, results) => {
                    if (err || !results) {
                        console.log(err);
                        await req.flash('info', CONFIG.ERROR_MSG + " 3");
                        return res.redirect("/");
                    }
                    await req.flash('info', "A poszt sikeresen törlésre került.");
                    return res.redirect("/");
                }
            )
        }
    )
});

module.exports = CHAT_ROUTE;
