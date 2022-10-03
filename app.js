const express = require('express');


// Global variables
const APP = express();
const PORT = 8080;
const BASE_TITLE = "Celebrate Together";
let counter = 0;


// Settings
APP.set("view engine", "pug");


// Paths
APP.get("/", (req, res) => {

    res.render("root", {
        title: BASE_TITLE + " - Alap",
        message: "Válassz valamit:"
    });

});

APP.get("/minus", (req, res) => {

    res.render("index", {
        title: BASE_TITLE + " - Minus",
        message: --counter
    });

});

APP.get("/plus", (req, res) => {

    res.render("index", {
        title: BASE_TITLE + " - Plus",
        message: ++counter
    });

});


// Starting up
APP.listen(PORT, () => {
    console.log(`Celebrate Together is up on http://127.0.0.1:${PORT}/`);
});
