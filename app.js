const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require("helmet");
const { flash } = require('express-flash-message');
const bcrypt = require('bcrypt');
const expressValidator = require("express-validator");

// Global variables
const APP = express();
const PORT = 8080;

// Middleware
APP.set("view engine", "pug");
APP.use(express.static('public'));
APP.use(morgan('tiny'));
APP.use(cors());
//APP.use(helmet());
APP.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use(flash({ sessionKeyName: 'flashMessage' }));
APP.use(expressValidator());
APP.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = null;
    }
    next();
});

// Routes
APP.use("/", require("./routes/index"));
APP.use("/", require("./routes/search"));
APP.use("/user", require("./routes/user"));

morgan.token('host', function(req, res) {
    return req.hostname;
});

// Starting up
APP.listen(PORT, () => {
    console.log("--");
    console.log('Time: ', Date.now());
    console.log(`Celebrate Together is up on http://127.0.0.1:${PORT}/ or http://localhost:8080/`);
});
