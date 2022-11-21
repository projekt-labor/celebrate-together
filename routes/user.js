"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const USER_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined, isFriend, newLock } = require("../src/utils");


USER_ROUTE.get("/notif", onlyLogined, (req, res) => {
    DB.query("SELECT * FROM user u RIGHT JOIN friend f ON(f.src_user_id=u.id) WHERE f.dest_user_id=? AND f.is_approved=0", 
    [req.session.user.id],
    (errors, result) => {
        if (errors) {
            return res.json({status:0});
        }

        return res.json({
            status: 1,
            notifications: result.map((r) => {
                return {
                    id: r.id,
                    url: "/user/"+r.src_user_id+"/s",
                    rurl: "/friend_request",
                    text: `${r.name} barátnak jelölte Önt`
                }
            })
        });
    });
});

USER_ROUTE.post("/:id/unfriend", onlyLogined, (req, res) => {
    return DB.query("SELECT * FROM user WHERE id=?", [req.params.id], (error, result) => {
        if (error || !result || result.length == 0) {
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/user/" + req.params.id);
        }

        const aid = req.session.user.id;
        const bid = result[0].id;

        return DB.query("DELETE FROM friend WHERE (src_user_id=? OR dest_user_id=?) OR (src_user_id=? OR dest_user_id=?)",
            [aid, bid, bid, aid], (error, _result) => {
                if (error) {
                    req.flash('info', CONFIG.ERROR_MSG);
                    return res.redirect("/user/" + req.params.id);
                }

                return res.redirect("/user/"+req.params.id+"/s");
                /*
                return res.render("user", {
                    title: CONFIG.BASE_TITLE,
                    messages: req.consumeFlash('info'),
                    user: req.session.user,
                    view_user: result[0]
                });
                */
            }
        );
    });
});

USER_ROUTE.post("/:id/friend", onlyLogined, (req, res) => {
    return DB.query("SELECT * FROM user WHERE id=?", [req.params.id], (error, result) => {
        if (error || !result || result.length == 0) {
            console.log(error)
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/user/" + req.params.id);
        }

        const aid = req.session.user.id;
        const bid = result[0].id;

        if (aid == bid) {
            console.log(error)
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/user/" + req.params.id);
        }

        const user = result[0];

        return DB.query("SELECT * FROM friend WHERE (src_user_id=? AND dest_user_id=?) OR (src_user_id=? AND dest_user_id=?)",
                [req.session.user.id, user.id, user.id, req.session.user.id],
                async (error, fr) => {
                    if (error) {
                        console.log(error)
                        req.flash('info', CONFIG.ERROR_MSG);
                        return res.redirect("/user/" + req.params.id);
                    }
                    console.log(fr);
                    if (fr && fr.length != 0) {
                        await req.flash('info', "Már küldött barát felkérést!");
                        return res.redirect("/user/"+req.params.id+"/s");
                    }
                    return await DB.query("INSERT INTO friend (src_user_id, dest_user_id, date, is_approved) VALUES (?, ?, ?, ?)",
                        [aid, bid, new Date(), 0], async (error, _result) => {
                            if (error) {
                                console.log(error)
                                req.flash('info', CONFIG.ERROR_MSG);
                                return res.redirect("/user/" + req.params.id);
                            }

                            return res.redirect("/user/"+req.params.id+"/s");
                            /*
                            return await res.render("user", {
                                title: CONFIG.BASE_TITLE,
                                messages: req.consumeFlash('info'),
                                user: req.session.user,
                                view_user: result[0]
                            });
                            */
                        }
                    );
                }
            )
    });
});

USER_ROUTE.post("/:id/unreq", onlyLogined, (req, res) => {
    return DB.query("SELECT * FROM user WHERE id=?", [req.params.id], (error, result) => {
        if (error || !result || result.length == 0) {
            console.log(error)
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/user/" + req.params.id);
        }

        const aid = req.session.user.id;
        const bid = result[0].id;

        if (aid == bid) {
            console.log(error)
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/user/" + req.params.id);
        }

        const user = result[0];

        return DB.query("SELECT * FROM friend WHERE (src_user_id=? AND dest_user_id=?) OR (src_user_id=? AND dest_user_id=?)",
                [req.session.user.id, user.id, user.id, req.session.user.id],
                async (error, fr) => {
                    if (error) {
                        console.log(error)
                        req.flash('info', CONFIG.ERROR_MSG);
                        return res.redirect("/user/" + req.params.id);
                    }
                    console.log(fr);
                    return await DB.query("DELETE FROM friend WHERE src_user_id=? AND dest_user_id=?",
                        [req.session.user.id, user.id], async (error, _result) => {
                            if (error) {
                                console.log(error)
                                req.flash('info', CONFIG.ERROR_MSG);
                                return res.redirect("/user/" + req.params.id);
                            }
                            req.flash('info', "Sikeresen töröltük a barátnak jelölést!");
                            return res.redirect("/user/"+req.params.id+"/s");
                        }
                    );
                }
            )
    });
});

USER_ROUTE.post("/delete", onlyLogined, async (req, res) => {
    /**
     * TRIGGER NEEDED
     */
    return DB.query("DELETE FROM user WHERE id=?",
    [req.session.user.id],
    (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/user/settings");
        }

        req.session.user = null;
        req.flash('info', "A profilodat sikeresen töröltük!");
        return res.redirect("/login");
    });
});

USER_ROUTE.get("/settings", onlyLogined, async (req, res) => {
    return res.render("settings", {
        title: CONFIG.BASE_TITLE + " - Beállítások",
        messages: await req.consumeFlash('info'),
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

USER_ROUTE.get("/friends", onlyLogined, async (req, res) => {
    return await DB.query("SELECT u.id, u.name FROM user u RIGHT JOIN friend f ON(f.src_user_id=u.id OR f.dest_user_id=u.id) WHERE u.id<>? AND f.is_approved=1 AND (f.src_user_id=? OR f.dest_user_id=?)",
    [req.session.user.id, req.session.user.id, req.session.user.id], async (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        if (results.length == 0) {
            results = false;
        }

        return res.render("friends", {
            title: CONFIG.BASE_TITLE + " - Barátok",
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            friends: results
        });
    });
});

USER_ROUTE.get("/:id", onlyLogined, (req, res) => {    
    return res.redirect("/user/" + req.params.id + "/s")
});

USER_ROUTE.get("/:id/:name", onlyLogined, async (req, res) => {
    return await DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.id=?`, [req.params.id], async (errors, results) => {
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

        return await DB.query("SELECT * FROM friend WHERE (src_user_id=? AND dest_user_id=?) OR (src_user_id=? AND dest_user_id=?)",
            [req.session.user.id, user.id, user.id, req.session.user.id],
            async (error, fr) => {
                if (error) {
                    console.log(errors);
                    await req.flash('info', CONFIG.ERROR_MSG);
                    return res.redirect("/");
                }

                return res.render("user", {
                    title: CONFIG.BASE_TITLE + " - " + user.name,
                    messages: await req.consumeFlash('info'),
                    user: req.session.user,
                    view_user: user,
                    status: (function () {
                        if (fr.length != 0) {
                            return fr[0].is_approved == 0 ? "not_approved" : "approved"
                        }
                        else {
                            return "none";
                        }
                    })()
                });
            }
        );
    });
});

module.exports = USER_ROUTE;
