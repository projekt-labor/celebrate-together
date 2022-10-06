"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

exports.onlyNotLogined = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        return res.redirect("/");
    }
};

exports.onlyLogined = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        return res.redirect("/");
        /*
        return res.redirect(
            "/register?redirect_to=" +
            req.protocol +
            "://" +
            req.get("host") +
            req.originalUrl
        );
        */
    }
};
