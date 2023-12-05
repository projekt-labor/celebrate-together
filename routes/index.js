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
                    return await DB.query(`SELECT u.id user_id, u.profile user_profile, u.name \`name\`, p.id post_id, p.message message, p.date date,
                    c.name c_name, c.text c_text, c.date c_date, c.profile c_profile, c.c_id c_id, c.location c_location
                    FROM comments c LEFT JOIN user u ON(u.id=c.user_id)
                                    LEFT JOIN post p ON(p.id=c.other_id)
                    WHERE p.is_public=1 AND u.id IN (${friendResults.map((r) => r.id).join(",")}, ?)
                    ORDER BY p.date DESC;`,
                    [req.session.user.id],
                    async (error, postWithComments) => {
                        if (error) 
                            console.log(errors);

                        let queryPostWithoutComments = `
                        SELECT u.id user_id, u.profile user_profile, u.name \`name\`, p.id post_id, p.message message, p.date date
                        FROM post p
                            LEFT JOIN user u ON(u.id=p.src_user_id)
                            LEFT JOIN comments c ON(c.other_id=p.id)
                        WHERE u.id IN (${friendResults.map((r) => r.id).join(",")}, ?) AND c.other_id IS NULL
                        ORDER BY p.date DESC;`;

                        return await DB.query(queryPostWithoutComments,
                            [req.session.user.id],
                            async (err, postWithoutComments) => {
                                if (err) console.log(err);
                                console.log("-------------------------");

                                return res.render("index", {
                                    title: CONFIG.BASE_TITLE,
                                    messages: await req.consumeFlash('info'),
                                    user: req.session.user,
                                    posts: postWithComments.concat(results).map((e) => {
                                        if (!e.hasOwnProperty("c_name")) {
                                            e.is_post = true;
                                        }
                                        else {
                                            e.is_post = false;
                                        }
                                        return e;
                                    }),
                                    user_recs: user_recs
                                });
                            }
                            );
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
INDEX_ROUTE.post("/comment/:id/create/:location/", onlyLogined, async (req, res) => {
    req.checkBody("text", "")
        .isLength({ min: 1 });
    console.log("INDEX_ROUTE Location: \n" + req.params.location + "\n--------------------");
    var l = "";
    if(req.params.location == "event") l="/events/";
    else l = "/";
    const errors = req.validationErrors();
    const text = req.body.text;
    if (errors) {
        req.flash('info', CONFIG.LOGIN_NOK);
        return res.redirect("/");
    }
    console.log("INDEX_ROUTE ID: \n" + req.params.id + "\n----------------");
    const c = `INSERT INTO ${CONFIG.COMMENT_TABLE_NAME} (user_id, other_id, type, text) VALUES (?, ?, ?, ?)`;
    if(l=="/"){
        return DB.query(c, [req.session.user.id, req.params.id, 0, text], (e,r) => { return res.redirect(l)});
    }
    else{
        return DB.query(c, [req.session.user.id, req.params.id, 1, text], (e,r) => { return res.redirect(l)});
    }
});

INDEX_ROUTE.post("/comment/:id/delete/:location/", onlyLogined, async (req, res) => {
    console.log("INDEX_ROUTE id: " + req.params.location + "\n-----------------------");
    var l = "";
    if(req.params.location == "post") l = "/";
    else l = "/events/";
    const c = `DELETE FROM ${CONFIG.COMMENT_TABLE_NAME} WHERE id = ?`;
    return await DB.query(c, [req.params.id], async (e,r) => {
        await req.flash('info', "A kommentet sikeresen töröltük!");
        return res.redirect(l)
    });
});

INDEX_ROUTE.post("/admin/:id/delete", onlyLogined, async (req, res) => {

    return DB.query("DELETE FROM user WHERE id=?",
    [req.params.id],
    (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/admin");
        }

        req.flash('info', "A fiókot sikeresen töröltük!");
        return res.redirect("/admin");
    });
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
    req.session.megerositeshez_email = email;

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
        req.flash('info', "Erősítsd meg az email címedet");

        const emailkod = (Math.floor(Math.random() * (1000000 - 100000)) + 100000).toString();
                    

            DB.query("UPDATE user SET email_code=? WHERE email=?", [emailkod, email], (errors, result) => {
                if (errors) throw errors;
            });

            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'info.celebratetogether@gmail.com',
                    pass: 'dmdo tkll xhrn qmxt'
                }
            });

            var mailOptions = {
                from: 'info.celebratetogether@gmail.com',
                to: email,
                subject: 'Email megerősítő kód',
                text: 'Email megerősítéséhez szükséges kód: ' + emailkod
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            return res.redirect("/email_confirm");
        }

    // 2. Felhasználó létrehozása
    const createAndSaveUser = (callback) => {
        return bcrypt.genSalt(10, (err, salt) => {
            return bcrypt.hash(password, salt, function(err, hash) {
                const q = `INSERT INTO ${CONFIG.USER_TABLE_NAME} (name, email, password, birth_day, \`profile\`, admin, email_conf) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                return DB.query(q, [name, email, hash, birthday, profile, 0, 0], callback);
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

                //ha nincs megerősítve az email
                if (!databaseResults[0].email_conf) {

                    req.session.megerositeshez_email = email;
                    req.flash('info', "Erősítsd meg az email címedet");

        const emailkod = (Math.floor(Math.random() * (1000000 - 100000)) + 100000).toString();
                    

            DB.query("UPDATE user SET email_code=? WHERE email=?", [emailkod, email], (errors, result) => {
                if (errors) throw errors;
            });

            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'info.celebratetogether@gmail.com',
                    pass: 'dmdo tkll xhrn qmxt'
                }
            });

            var mailOptions = {
                from: 'info.celebratetogether@gmail.com',
                to: email,
                subject: 'Email megerősítő kód',
                text: 'Email megerősítéséhez szükséges kód: ' + emailkod
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            return res.redirect("/email_confirm");

                }

                // SIKERES BEJELENTKEZÉS

                //nullázza a jelszókódot ha időközben rájöttünk a jelszóra
                if (databaseResults[0].pass_code != null) {
                    DB.query("UPDATE user SET pass_code=NULL WHERE email=?", [email], (errors, result) => {
                        if (errors) throw errors;
                        console.log("Jelszó visszaállítás törölve");
                    });
                }

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
            SELECT DISTINCT e.id id, e.name name, e.text text, e.place place, e.event_date event_date, ue.user_id user_id
            FROM event e LEFT JOIN user_event_switch ue ON(ue.event_id=e.id)
            WHERE user_id IN (${fstr}) AND event_date > CURDATE()
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
     
        `,
    [
        dates[0].getMonth()+1, dates[0].getDate(),
        dates[1].getMonth()+1, dates[1].getDate(),
        dates[2].getMonth()+1, dates[2].getDate(),
        dates[3].getMonth()+1, dates[3].getDate(),
        dates[4].getMonth()+1, dates[4].getDate(),
        
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

//újabb dolgok

//jelszó helyreállítás
INDEX_ROUTE.get("/new_password_request", onlyNotLogined, async (req, res) => {
    return res.render("new_password_request", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});


INDEX_ROUTE.post("/new_password_request", onlyNotLogined, async (req, res) => {
    req.checkBody("email", "")
        .isEmail()
        .isLength({ min: 1 });

    const errors = req.validationErrors();
    const email = req.body.email;
    req.session.jelszo_helyreallitas_email = req.body.email;
    const kod = (Math.floor(Math.random() * (1000000 - 100000)) + 100000).toString();
    


    DB.query(`SELECT * FROM user u WHERE u.email=?`, [email], function (err, result) {
        if (err){
            req.flash('info', "Váratlan hiba történt");
            return res.redirect("/new_password_request");
        }

        if (result.length == 0)
        {
            console.log("valami")
            req.flash('info', "Ilyen Email címmel nincs felhasználó");
            return res.redirect("/new_password_request");
        }

        else {
            DB.query("UPDATE user SET pass_code=? WHERE email=?", [kod, email], (errors, result) => {
                if (errors) throw errors;
            });

            var nodemailer = require('nodemailer');

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'info.celebratetogether@gmail.com',
                    pass: 'dmdo tkll xhrn qmxt'
                }
            });

            var mailOptions = {
                from: 'info.celebratetogether@gmail.com',
                to: email,
                subject: 'Jelszó-helyreállítási kód',
                text: 'Jelszó-helyreállításhoz szükséges kód: ' + kod
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            console.log(req.body);
            return res.redirect("/new_password_code");
        }
    });
});

INDEX_ROUTE.get("/new_password_code", onlyNotLogined, async (req, res) => {
    return res.render("new_password_code", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});


INDEX_ROUTE.post("/new_password_code", onlyNotLogined, async (req, res) => {
    req.checkBody("jelszokod", "")
        .isLength({ min: 6 });
    const email = req.session.jelszo_helyreallitas_email;
    var jelszokod = req.body.jelszokod;

    DB.query(`SELECT * FROM user u WHERE u.email=? AND u.pass_code=?`, [email, jelszokod], function (err, result) {
        if (err){
            req.flash('info', "valami nem jó");
            return res.redirect("/new_password_code");
        }      

        if (result.length == 1){
            
            console.log(req.body);
            return res.redirect("/new_password");
        }

        else 
        {
            console.log("valami")
            req.flash('info', "nem jó a kód");
            return res.redirect("/new_password_code");
        }
    });

});



INDEX_ROUTE.get("/new_password", onlyNotLogined, async (req, res) => {
    return res.render("new_password", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});


INDEX_ROUTE.post("/new_password", onlyNotLogined, async (req, res) => {
    const email = req.session.jelszo_helyreallitas_email;
    req.checkBody("password", "")
        .isLength({ min: 1 });
    req.checkBody("password_again", "")
        .isLength({ min: 1 });
    const password = req.body.password;
    const passwordAgain = req.body.password_again;

    const errors = req.validationErrors();


    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', "hiba a bemenetekkel");
        return res.redirect("/new_password");
    }
    if (password != passwordAgain) {
        req.flash('info', "A megadott jelszavak nem egyeznek!");
        return res.redirect("/new_password");
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            DB.query("UPDATE user SET password=? WHERE email=?", [hash, email], (errors, result) => {
                if (errors) throw errors;
            });
        });
    });

    DB.query("UPDATE user SET pass_code=NULL WHERE email=?", [email], (errors, result) => {
        if (errors) throw errors;
    });

    req.flash('info', "Jelszó visszaállítás sikeres");
    return res.redirect("/login");


});



//email megerősítés
INDEX_ROUTE.get("/email_confirm", onlyNotLogined, async (req, res) => {
    return res.render("email_confirm", {
        title: CONFIG.BASE_TITLE,
        messages: await req.consumeFlash('info'),
        user: req.session.user
    });
});



INDEX_ROUTE.post("/email_confirm", onlyNotLogined, async (req, res) => {
    const email = req.session.megerositeshez_email;

    console.log(email);

    req.checkBody("emailkod", "")
        .isLength({ min: 6 });
    var emailkod = req.body.emailkod;

    DB.query(`SELECT * FROM user u WHERE u.email=? AND u.email_code=?`, [email, emailkod], function (err, result) {
        if (err){
            req.flash('info', "valami nem jó");
            return res.redirect("/email_confirm");
        }      

        if (result.length == 1){
            DB.query("UPDATE user SET email_conf=? WHERE email_code=?", [1, emailkod], (errors, result) => {
                if (errors) throw errors;
            });

            DB.query("UPDATE user SET email_code=NULL WHERE email=?", [email], (errors, result) => {
                if (errors) throw errors;
            });

            req.flash('info', "Email cím megerősítve!");
            return res.redirect("/login");
        }

        else 
        {
            console.log("valami")
            req.flash('info', "nem jó a kód");
            return res.redirect("/email_confirm");
        }
    });

});

//admin oldal
INDEX_ROUTE.get("/admin", onlyLogined, async (req, res) => {

    return await DB.query("SELECT u.id, u.name name, u.profile `profile` FROM user u WHERE u.id<>? ORDER BY name",[req.session.user.id],
    async (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        if (results.length == 0) {
            results = false;
        }


        return res.render("admin", {
            title: CONFIG.BASE_TITLE,
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            users:results
        });
    });
});

module.exports = INDEX_ROUTE;