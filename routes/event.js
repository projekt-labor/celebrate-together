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

EVENT_ROUTE.post("/:id/edit", onlyLogined, async (req, res) => {    
    req.checkBody("name", "")
        .isLength({ min: 1 });
    req.checkBody("text", "")
        .isLength({ min: 1 });
    req.checkBody("place", "")
        .isLength({ min: 1 });

    const errors = req.validationErrors();

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.ERROR_MSG);
        return res.redirect("/event/"+req.params.id+"/edit");
    }

    return DB.query("UPDATE event e SET name=?, text=?, place=? WHERE e.id=?",
    [req.body.name, req.body.text, req.body.place, req.params.id],
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

    const errors = req.validationErrors();

    if (errors) {
        console.log("\nHiba a bemenetekkel!\n");
        console.log(errors);
        req.flash('info', CONFIG.ERROR_MSG);
        return res.redirect("/event/create");
    }

    return await DB.query("INSERT INTO event (name, text, place) VALUES (?, ?, ?)",
        [req.body.name, req.body.text, req.body.place],
        async (errors, results) => {
        if (errors) {
            console.log(errors);
            req.flash('info', CONFIG.ERROR_MSG);
            return res.redirect("/event/create");
        }

        return DB.query("SELECT * FROM event WHERE name=? AND text=? AND place=?",
        [req.body.name, req.body.text, req.body.place],
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

EVENT_ROUTE.get("/:id/:name", onlyLogined, async (req, res) => {
    return await DB.query(`SELECT * FROM event e LEFT JOIN user_event_switch ue ON(e.id=ue.event_id) WHERE e.id=?`, [req.params.id], async (errors, results) => {
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
            messages: await req.consumeFlash('info'),
            user: req.session.user,
            event: e,
            is_editor: results[0].is_editor==1
        });
    });
});

EVENT_ROUTE.get("/:id", onlyLogined, (req, res) => {    
    return res.redirect("/event/" + req.params.id + "/s")
});

module.exports = EVENT_ROUTE;
