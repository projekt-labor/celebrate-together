const express = require('express');

// Global variables
const APP = express();
const PORT = 8080;

// Middleware
APP.set("view engine", "pug");
APP.use(express.static('public'));

// Routes
APP.use("/", require("./routes/index"));

// Starting up
APP.listen(PORT, () => {
    console.log("--");
    console.log('Time: ', Date.now());
    console.log(`Celebrate Together is up on http://127.0.0.1:${PORT}/ or http://localhost:8080/`);
});
