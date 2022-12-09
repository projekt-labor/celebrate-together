"use strict";
const bcrypt = require('bcrypt');
const express = require('express');
const EVENT_ROUTE = express.Router();
const DB = require("../src/database");
const Event = require("../models/event");
const CONFIG = require("../config");
const { onlyLogined, onlyNotLogined } = require("../src/utils");
const e = require('express');


EVENT_ROUTE.get("/:id/edit", onlyLogined, async (req, res) => {    
    return await DB.query(`SELECT * FROM event e LEFT JOIN user_event_switch ue ON(e.id=ue.event_id) WHERE e.id=? AND ue.user_id=? AND ue.is_editor=1`,
    [req.params.id, req.session.user.id],
    async (errors, results) => {
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
        return res.render("event_edit", {
            title: CONFIG.BASE_TITLE + " - " + e.name,
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            event: e
        });
    });
});

/*EVENT_ROUTE.post("/comment/:id/create", onlyLogined, async (req, res) => {
    req.checkBody("text", "")
        .isLength({ min: 1 });
    
    const errors = req.validationErrors();
    const text = req.body.text;
    if (errors) {
        req.flash('info', CONFIG.LOGIN_NOK);
        return res.redirect("/");
    }
    console.log("EVENT_ROUTE ID: \n" + req.params.id + "\n----------------");
    const c = `INSERT INTO ${CONFIG.COMMENT_TABLE_NAME} (user_id, other_id, type, text) VALUES (?, ?, ?, ?)`;
    return DB.query(c, [req.session.user.id, req.params.id, 1, text], (e,r) => { return res.redirect("/")});

});*/

/*EVENT_ROUTE.post("/comment/:id/delete/", onlyLogined, async (req, res) => {
    console.log("EVENT_ROUTE: id: \n" + req.params.id + "\n------------------");
    const c = `DELETE FROM ${CONFIG.COMMENT_TABLE_NAME} WHERE id = ?`;
    return DB.query(c, [req.params.id], (e,r) => { return res.redirect("/")});
});*/

EVENT_ROUTE.post("/:id/edit", onlyLogined, async (req, res) => {    
    req.checkBody("name", "")
        .isLength({ min: 1 });
    req.checkBody("text", "")
        .isLength({ min: 1 });
    req.checkBody("place", "")
        .isLength({ min: 1 });
    req.checkBody("event_date", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.ERROR_MSG);
        return res.redirect("/event/"+req.params.id+"/edit");
    }

    return DB.query("UPDATE event e SET name=?, text=?, place=?, event_date=? WHERE e.id=?",
    [req.body.name, req.body.text, req.body.place, req.body.event_date, req.params.id],
    (errors, result) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/event/"+req.params.id+"/edit");
        }

        req.flash('info', "Az esemény módosítását sikeresen mentettük");
        return res.redirect("/event/"+req.params.id+"/e");
    });
});

EVENT_ROUTE.post("/:id/delete", onlyLogined, async (req, res) => {    
    return DB.query("SELECT * FROM event e LEFT JOIN user_event_switch ue ON(ue.event_id=e.id) WHERE ue.is_editor=1 AND ue.user_id=5",
    [req.params.id],
    (errors, result) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/event/"+req.params.id+"/edit");
        }

        if (result.length == 0) {
            req.flash('info', "Az esemény nem törölhető");
            return res.redirect("/event/");    
        }

        return DB.query("DELETE FROM user_event_switch WHERE event_id=? AND user_id=?",
        [req.params.id, req.session.user.id],
        (errors, result) => {
            if (errors) {
                console.log(errors);
                req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/event/"+req.params.id+"/edit");
            }

            return DB.query("DELETE FROM event WHERE id=?", [req.params.id], (errors, results) => {
                if (errors) {
                    console.log(errors);
                    req.flash('info', CONFIG.ERROR_MSG);
                    return res.redirect("/event/"+req.params.id+"/edit");
                }

                req.flash('info', "Az esemény sikeresen törölve");
                return res.redirect("/event/");
            })
        });
    });
});

EVENT_ROUTE.get("/", onlyLogined, async (req, res) => { 
    return await DB.query("SELECT * FROM event e LEFT JOIN user_event_switch ue ON(ue.event_id=e.id) WHERE ue.user_id=? AND ue.is_editor=1",
    [req.session.user.id],
    async (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        if (results.length == 0) {
            results = false;
        }

        return res.render("my_events", {
            title: CONFIG.BASE_TITLE + " - Eseményeim",
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            events: results
        });
    });
});

EVENT_ROUTE.get("/create", onlyLogined, async (req, res) => {    
    return res.render("event_create", {
        title: CONFIG.BASE_TITLE + " - Esemény meghirdetése",
        messages: await req.consumeFlash('info'),
        user: req.session.user,
    });
});

EVENT_ROUTE.post("/create", onlyLogined, async (req, res) => {    
    req.checkBody("name", "")
        .isLength({ min: 1 });
    req.checkBody("text", "")
        .isLength({ min: 1 });
    req.checkBody("place", "")
        .isLength({ min: 1 });
    req.checkBody("event_date", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.ERROR_MSG);
        return res.redirect("/event/create");
    }

    return await DB.query("INSERT INTO event (name, text, place, event_date) VALUES (?, ?, ?, ?)",
        [req.body.name, req.body.text, req.body.place, req.body.event_date],
        async (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/event/create");
        }

        return DB.query("SELECT * FROM event WHERE name=? AND text=? AND place=? AND event_date=?",
        [req.body.name, req.body.text, req.body.place, req.body.event_date],
        (errors, events) => {
            if (errors) {
                console.log(errors);
                req.flash('info', CONFIG.ERROR_MSG);
                return res.redirect("/event/create");
            }

            return DB.query("INSERT INTO user_event_switch (user_id, event_id, date, is_editor) VALUES (?, ?, ?, ?)",
            [req.session.user.id, events[0].id, new Date(), 1],
            (errors, result) => {
                if (errors) {
                    console.log(errors);
                    req.flash('info', CONFIG.ERROR_MSG);
                    return res.redirect("/event/create");
                }
                
                req.flash('info', "Az eseményt sikeresen meghirdettük");
                return res.redirect("/event");
            });
        })
    });
});

EVENT_ROUTE.get("/:id/attend", onlyLogined, async (req, res) => {
    return await DB.query("INSERT INTO user_event_switch (user_id, event_id, date, is_editor) VALUES (?, ?, ?, ?)",
    [req.session.user.id, req.params.id, new Date(), 0],
    async (errors, result) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/event/" + req.params.id + "/s");
        }
        
        await req.flash('info', "Az eseményen való részvételi jelzést sikeresen mentettük!");
        return res.redirect("/event/" + req.params.id + "/s");
    });
});

EVENT_ROUTE.get("/:id/unattend", onlyLogined, async (req, res) => {
    return await DB.query("DELETE FROM user_event_switch WHERE user_id=? AND event_id=?",
    [req.session.user.id, req.params.id],
    async (errors, result) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/event/" + req.params.id + "/s");
        }
        
        await req.flash('info', "Az eseményen való részvételi jelzést sikeresen töröltük!");
        return res.redirect("/event/" + req.params.id + "/s");
    });
});

EVENT_ROUTE.get("/:id/:name", onlyLogined, async (req, res) => {
    return await DB.query(`SELECT f.src_user_id \`user_id\`, u.name \`name\`, u.id id  FROM user u RIGHT JOIN friend f ON(f.src_user_id=u.id OR f.dest_user_id=u.id)
    WHERE f.is_approved=1 AND (f.src_user_id=? OR f.dest_user_id=?) GROUP BY u.id`,
    [req.session.user.id, req.session.user.id],
    async (error, friendResults) => {
        if (error) {
            console.log(error);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.render("event", {
                title: CONFIG.BASE_TITLE,
                messages: await req.consumeFlash('info'),
                user: req.session.user
            });
        }
    return await DB.query(`
    SELECT *,
    (SELECT ue1.is_editor FROM event e1 LEFT JOIN user_event_switch ue1
         ON(e1.id=ue1.event_id) WHERE e1.id=? AND ue1.user_id=?) is_user_editor,
    (SELECT COUNT(*)
     FROM event e1
    LEFT JOIN user_event_switch ue1 ON(e1.id=ue1.event_id)
    WHERE e1.id=? AND ue1.user_id=?) is_user_attending
    FROM event e
    LEFT JOIN user_event_switch ue ON(e.id=ue.event_id)
    WHERE e.id= ?
    LIMIT 1
    `,
    [req.params.id, req.session.user.id, req.params.id, req.session.user.id, req.params.id],
    async (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/");
        }

        if (results.length == 0) {
            req.flash('info', CONFIG.EVENT_NOT_FOUND);
            return res.redirect("/");
        }

        console.log(results[0]);
        console.log("igenigenigen");

        return DB.query(`SELECT * FROM user_event_switch ue LEFT JOIN user u ON(u.id=ue.user_id) WHERE ue.event_id=?`,
        [req.params.id],
        async (errors, attendants) => {
            if (errors) {
                console.log(errors);
                attendants = [];
            }
            return await DB.query(`SELECT u.id user_id, u.profile user_profile, u.name u_name, e.id event_id, e.name event_name, e.text event_text, e.event_date event_date,
                                c.c_id c_id, c.name c_name, c.text c_text, c.date c_date, c.profile c_profile, c.user_id c_user_id, c.location c_location
                                FROM comments c LEFT JOIN user u ON(u.id=c.user_id)
                                                LEFT JOIN event e ON(e.id = c.other_id)
                                WHERE c.location="event" AND c.other_id = ? AND u.id IN (${friendResults.map((r) => r.id).join(",")}, ?)
                                ORDER BY e.event_date DESC;`,
            [req.params.id, req.session.user.id],
            async (error, commentss) => {
                if (error) console.log(errors);
                return await DB.query(`SELECT event.id event_id, event.name event_name,
                 event.text event_text, event.place event_place, event.event_date event_date FROM event WHERE event.id = ?`,
                [req.params.id],
                async (err, result_event) => {
                    if(err) console.log(err);
                    commentss.concat(result_event).concat(results);
                    return res.render("event", {
                        title: CONFIG.BASE_TITLE + " - " + results[0].name,
                        messages: await req.consumeFlash('info'),
                        user: req.session.user,
                        event: commentss.map((re) => {
                            //console.log("EWC: \n: " + re.event_name + "\n------------");
                            return re;
                        }),
                        attendants: attendants,
                        result_event: result_event
                        });
                    });
                });
            });
            console.log("\nResult:\n" + results[0].event_date + "\n----------------------");
            
        

    });
});
});


EVENT_ROUTE.get("/:id", onlyLogined, (req, res) => {    
    return res.redirect("/event/" + req.params.id + "/s")
});

module.exports = EVENT_ROUTE;
