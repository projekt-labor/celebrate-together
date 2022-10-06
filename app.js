"use strict";
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
const cors = require('cors');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require('bcrypt');
const expressValidator = require("express-validator");
const cookieParser = require("cookie-parser");
const { flash } = require('express-flash-message');

// Global variables
const APP = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
let redirect_to = "";

// HTTP or HTTPS?
if (NODE_ENV === "development") {
    APP.use(logger("dev"));
} else {
    APP.use(helmet());
    APP.use(logger('tiny'));
    APP.enable("trust proxy");  // Only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    
    // Against DDOS attacks
    APP.use(
        rateLimit({
            windowMs: 1 * 60 * 1000,  // 1 minutes
            max: 250  // limit each IP to 250 requests per windowMs
        }
    ));
}

// Middleware
APP.set("view engine", "pug");
APP.use(express.static('public'));
APP.use(cookieParser());
APP.use(cors());
/*
APP.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
*/
APP.use(
    session({
      secret: "QPprI0iM0IORfg8E",
      cookie: {
        HttpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000  // 365 days
      },
      saveUninitialized: false,
      resave: false
    })
);
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

// Redirect from url
// example: http://127.0.0.1:8080/?redirect_to=/settings
// will redirect to /settings
APP.use((req, res, next) => {
    /*
    if (req.query.redirect_to) {
        redirect_to = req.query.redirect_to;
    }
    */
    next();
});

// Routes
APP.use("/", require("./routes/index"));
APP.use("/", require("./routes/search"));
APP.use("/user", require("./routes/user"));

APP.use((req, res, next) => {
    redirect_to = null;
    next();
});

logger.token('host', (req, res) => {
    return req.hostname;
});

// Starting up
APP.listen(PORT, () => {
    console.log("--");
    console.log('Time: ', Date.now());
    console.log(`Celebrate Together is up on http://127.0.0.1:${PORT}/ or http://localhost:8080/`);
});
