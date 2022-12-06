"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const INDEX_ROUTE = express.Router();
const DB = require("../src/database");
const User = require("../models/user");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");
const Post = require('../models/post');


Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

INDEX_ROUTE.get("/friend_request/:id/positive", async (req, res, next) => {
    return DB.query("UPDATE friend SET is_approved=1 WHERE id=?",
    [req.params.id],
    (errors, result) => {
        return res.redirect("/user/friends");
    });
});

INDEX_ROUTE.get("/friend_request/:id/negative", async (req, res, next) => {
    return DB.query("DELETE FROM friend WHERE id=?",
    [req.params.id],
    (errors, result) => {
        return res.redirect("/user/friends");
    });
});

INDEX_ROUTE.get("/", async (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    /*async function getComments(post, callback) {
        console.log("\nGETCOMMENTS function: " + post.post_id + "\n-----------------------")
        return await DB.query(`
        SELECT c.user_id user_id, c.other_id other_id, c.text as text, c.date
        FROM comment c
            left OUTER join post p on c.other_id = p.id
            left join user u on c.user_id = u.id
        Where c.other_id = ?;
        `,
        [post.post_id],
        async (err, res) => {
            if (err) console.log(err);
            return await callback(res);
        });
    }*/

    return await DB.query(
    `SELECT f.src_user_id \`user_id\`, u.name \`name\`, u.id id  FROM user u RIGHT JOIN friend f ON(f.src_user_id=u.id OR f.dest_user_id=u.id)
    WHERE f.is_approved=1 AND (f.src_user_id=? OR f.dest_user_id=?) GROUP BY u.id`,
    [req.session.user.id, req.session.user.id],
    async (errors, friendResults) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.render("index", {
                title: CONFIG.BASE_TITLE,
                messages: await req.consumeFlash('info'),
                user: req.session.user,
                posts: []
            });
        }

        let REQREQ = `
        SELECT u.id id, u.name \`name\`, u.profile \`profile\`, f.id fid, f.src_user_id src_user_id, f.dest_user_id dest_user_id
        FROM user u
        LEFT JOIN friend f ON(f.src_user_id=u.id OR f.dest_user_id=u.id)
        WHERE u.id<>? AND (f.id IS NULL OR (f.src_user_id<>? AND f.dest_user_id<>?))
        GROUP BY 1
        ORDER BY 1;
        `;

        

        return await DB.query(`
        SELECT u.id user_id, u.profile user_profile, u.name name, post.id post_id, post.message message, post.date date
        FROM post LEFT JOIN user u ON(u.id=post.src_user_id OR u.id = post.dest_user_id)
        WHERE post.is_public=1 AND u.id IN (${friendResults.map((r) => r.id).join(",")}, ?)
        ORDER BY post.date DESC;`,
            [req.session.user.id],
            async (errors, results) => {
                if (errors) {
                    results = [];
                    console.log(errors);

                    return await DB.query(`
                    SELECT u.id user_id, u.profile user_profile, u.name, name, p.id post_id, p.message message, p.date date
                    FROM post p LEFT JOIN user u ON(u.id=p.src_user_id)
                    WHERE p.is_public=1 AND u.id=?
                    ORDER BY p.date DESC;`,
                    [req.session.user.id],
                    async (err, ress) => {
                        if (err) console.log(errors);
                        return await DB.query(REQREQ,
                        [req.session.user.id, req.session.user.id, req.session.user.id],
                        async (error, user_recs) => {
                            if (error) console.log(errors);
                            return res.render("index", {
                                title: CONFIG.BASE_TITLE,
                                messages: await req.consumeFlash('info'),
                                user: req.session.user,
                                posts: ress.map((p) => {
                                    return p;
                                }),
                                user_recs: user_recs
                            });
                        });
                    });
                }

                
                
                console.log("Posztok:");
                console.log(results);

                return await DB.query(REQREQ,
                [req.session.user.id, req.session.user.id, req.session.user.id],
                async (error, user_recs) => {
                    if (error) console.log(errors);
                    return await DB.query(`SELECT u.id user_id, u.profile user_profile, u.name name, p.id post_id, p.message message, p.date date,
                    c.name c_name, c.text c_text, c.date c_date, c.profile c_profile
                    FROM comments c LEFT JOIN user u ON(u.id=c.user_id)
                                    LEFT JOIN post p ON(p.id = c.other_id)
                    WHERE p.is_public=1 AND u.id IN (${friendResults.map((r) => r.id).join(",")}, ?)
                    ORDER BY p.date DESC;`,
                    [req.session.user.id],
                    async (error, postWithComments) => {
                        if (error) console.log(errors);
                        return res.render("index", {
                            title: CONFIG.BASE_TITLE,
                            messages: await req.consumeFlash('info'),
                            user: req.session.user,
                            posts: postWithComments.map((pwc) => {
                                return pwc;
                            }),
                            user_recs: user_recs
                        });
                    });
                });
            });
    });
});

INDEX_ROUTE.get("/register", onlyNotLogined, async (req, res) => {
    return res.render("register", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.post("/settings", onlyLogined, (req, res) => {
    return res.redirect("/user/settings");
});

INDEX_ROUTE.get("/logout", onlyLogined, async (req, res) => {
    req.session.user = null;
    return res.redirect("/");
});
INDEX_ROUTE.post("/comment/:id/create", onlyLogined, async (req, res) => {
    req.checkBody("text", "")
        .isLength({ min: 1 });
    const errors = req.validationErrors();
    const text = req.body.text;
    if (errors) {
        req.flash('info', CONFIG.LOGIN_NOK);
        return res.redirect("/");
    }

    const c = `INSERT INTO ${CONFIG.COMMENT_TABLE_NAME} (user_id, other_id, type, text) VALUES (?, ?, ?, ?)`;
    return DB.query(c, [req.session.user.id, req.params.id, 0, text], (e,r) => { return res.redirect("/")});

});

INDEX_ROUTE.post("/logout", onlyLogined, async (req, res) => {
    req.session.user = null;
    return res.redirect("/");
});

INDEX_ROUTE.post("/register", onlyNotLogined, async (req, res) => {    
    req.checkBody("name", "")
        .isLength({ min: 1 });
    req.checkBody("email", "")
        .isEmail()
        .isLength({ min: 1 });
    req.checkBody("password", "")
        .isLength({ min: 1 });
    req.checkBody("password_again", "")
        .isLength({ min: 1 });
    req.checkBody("birthday", "")
        .isLength({ min: 4 });

    const errors = req.validationErrors();
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const passwordAgain = req.body.password_again;
    const birthday = req.body.birthday;

    let profile = req.body.profile || 'avatar1.png';
    
    if (profile.includes("/")) {
        profile = profile.split("/");
        profile = profile[profile.length - 1];
    }

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.REGISTER_NOK);
        return res.redirect("/register");
    }

    if (password != passwordAgain) {
        req.flash('info', "A megadott jelszavak nem egyeznek!");
        return res.redirect("/register");
    }

    // 3. Felhasználó beléptetése
    const getAndLogInUser = (error, result) => {
        if (error) {
            console.log(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/register");
        }

        // SIKERES REGISZTRÁCIÓ
        req.session.user = new User().fromDB(result[0]);
        return res.redirect("/");
    };

    // 2. Felhasználó létrehozása
    const createAndSaveUser = (callback) => {
        return bcrypt.genSalt(10, (err, salt) => {
            return bcrypt.hash(password, salt, function(err, hash) {
                const q = `INSERT INTO ${CONFIG.USER_TABLE_NAME} (name, email, password, birth_day, \`profile\`) VALUES (?, ?, ?, ?, ?)`;
                return DB.query(q, [name, email, hash, birthday, profile], callback);
            });
        });
    };

    // 1. Keressük hogy az email foglalt-e?
    const isTheEmailReserved = (error, databaseResults) => {
        if (error) {
            console.log(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/register");
        }
        if (databaseResults.length != 0) {
            console.log("\nVan már ilyen email-el felhasználó!\n");
            req.flash('info', CONFIG.REGISTER_NOK);
            return res.redirect("/register");
        }
        return createAndSaveUser((error, databaseResults2) => {
            if (error) {
                console.log(error);
                req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/register");
            }
            return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.email=?`, [email], getAndLogInUser)
        });
    };

    return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.email=?`, [email], isTheEmailReserved);
});

INDEX_ROUTE.get("/login", onlyNotLogined, async (req, res) => {
    res.render("login", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.post("/login", onlyNotLogined, (req, res) => {
    req.checkBody("email", "")
        .isEmail()
        .isLength({ min: 1 });
    req.checkBody("password", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();
    const email = req.body.email;
    const password = req.body.password;
        
    if (errors) {
        req.flash('info', CONFIG.LOGIN_NOK);
        return res.redirect("/login");
    }

    // 1. Adatok lekérése az adatbázisból
    const databaseResCallback = (error, databaseResults) => {
            console.log(error, databaseResults);

            if (error || !databaseResults || databaseResults.length == 0) {
                req.flash('info', CONFIG.LOGIN_NOK);
                return res.redirect("/login");
            }

            // 2. Jelszó ellenőrzése
            return bcrypt.compare(password, databaseResults[0].password, (error, isMatch) => {
                if (error) {
                    console.error(error);
                    req.flash('info', CONFIG.ERROR_MSG);
                    return res.redirect("/login");
                }
                if (!isMatch) {
                    req.flash('info', CONFIG.LOGIN_NOK);
                    return res.redirect("/login");
                }

                // SIKERES BEJELENTKEZÉS
                let dbu = databaseResults[0];
                req.session.user = new User().fromDB(dbu);
                console.log("Login:");
                console.log(req.session.user);
                console.log(dbu);
                return res.redirect("/");
            });
            
    };
    return DB.query(`SELECT * FROM ${CONFIG.USER_TABLE_NAME} u WHERE u.email=?`, [email], databaseResCallback);
});

INDEX_ROUTE.get("/terms", async (req, res) => {
    return res.render("terms", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.get("/contact", async (req, res) => {
    return res.render("contact", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});

INDEX_ROUTE.get("/events", onlyLogined, async (req, res) => {
    return await DB.query(
        `SELECT f.src_user_id \`user_id\`, u.name \`name\`, u.id id  FROM user u RIGHT JOIN friend f ON(f.src_user_id=u.id OR f.dest_user_id=u.id)
        WHERE f.is_approved=1 AND (f.src_user_id=? OR f.dest_user_id=?) GROUP BY u.id`,
        [req.session.user.id, req.session.user.id],
        async (errors, friendResults) => {
            if (errors) {
                console.log(errors);
                req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/");
            }

            await friendResults.push({id: new String(req.session.user.id)});
            let fstr = (friendResults.map((r) => r.id).join(",")).trim();
            await (function() {
                if (fstr[0]==",") fstr = fstr.substr(1);
                if (fstr[fstr.length-1]==",") fstr = fstr.substr(0,fstr.length-1);
            })();

            return await DB.query(`
            SELECT DISTINCT e.id id, e.name name, e.text text, e.place place, ue.user_id user_id
            FROM event e LEFT JOIN user_event_switch ue ON(ue.event_id=e.id)
            WHERE user_id IN (${fstr})
            GROUP BY id;
            `,
            [req.session.user.id, req.session.user.id],
            async (error, result) => {
                if (error) {
                    console.error(error);
                    req.flash('info', CONFIG.ERROR_MSG);
                    return res.redirect("/");
                }

                return res.render("events", {
                    title: CONFIG.BASE_TITLE,
                    messages: await req.consumeFlash('info'),
                    user: req.session.user,
                    events: result
                });
            });
        });
});

INDEX_ROUTE.get("/birthdays", onlyLogined, async (req, res) => {
    let dates = [
        new Date().addDays(-4),
        new Date().addDays(-3),
        new Date().addDays(-2),
        new Date().addDays(-1),
        new Date(),
        new Date().addDays(1),
        new Date().addDays(2),
        new Date().addDays(3),
        new Date().addDays(4),
    ];

    return await DB.query(`
    SELECT * FROM user u WHERE
       (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?) 
    OR (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?)
    OR (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?) 
    OR (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?) 
    OR (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?)
    OR (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?)
    OR (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?)
    OR (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?)
    OR (MONTH(u.birth_day)=? AND DAY(u.birth_day)=?) 
        `,
    [
        dates[0].getMonth()+1, dates[0].getDate(),
        dates[1].getMonth()+1, dates[1].getDate(),
        dates[2].getMonth()+1, dates[2].getDate(),
        dates[3].getMonth()+1, dates[3].getDate(),
        dates[4].getMonth()+1, dates[4].getDate(),
        dates[5].getMonth()+1, dates[5].getDate(),
        dates[6].getMonth()+1, dates[6].getDate(),
        dates[7].getMonth()+1, dates[7].getDate(),
        dates[8].getMonth()+1, dates[8].getDate(),
    ],
    async (error, result) => {
        if (error) {
            console.error(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        console.log(dates[0].getMonth()+1);
        console.log(dates[0].getDate());

        return res.render("birthdays", {
            title: CONFIG.BASE_TITLE,
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            birthdays: result
        });
    });
});

// friends
// the messages for the choosen person
INDEX_ROUTE.get("/messages", onlyLogined, async (req, res) => {
    return DB.query(`SELECT u.id, u.name name, u.profile \`profile\` FROM user u RIGHT JOIN friend f ON(f.src_user_id=u.id OR f.dest_user_id=u.id) WHERE u.id<>? AND f.is_approved=1 AND (f.src_user_id=? OR f.dest_user_id=?)`,
    [req.session.user.id, req.session.user.id, req.session.user.id],
    async (err, friends) => {
        if (err) {
            console.log(err);
            friends = [];
        }

        return res.render("messages", {
            title: CONFIG.BASE_TITLE,
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            friends: friends
        });
    });
});

module.exports = INDEX_ROUTE;
