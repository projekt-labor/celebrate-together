const express = require('express');


// Global variables
const APP = express();
const PORT = 8080;
const BASE_TITLE = "Celebrate Together";


// Settings
APP.set("view engine", "pug");
APP.use(express.static('public'));


// Paths
APP.get("/", (req, res) => {

    res.render("index", {
        title: BASE_TITLE
    });
});


// Starting up
APP.listen(PORT, () => {
    console.log(`Celebrate Together is up on http://127.0.0.1:${PORT}/`);
});
