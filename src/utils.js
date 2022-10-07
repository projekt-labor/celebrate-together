"use strict";
const DB = require("../src/database");


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

/**
 * nr = no request
 * na = not accepted
 * a = accepted
 */
exports.isFriend = (aid, bid) => {
    return DB.query("SELECT * FROM friend WHERE (src_user_id=? OR dest_user_id=?) OR (src_user_id=? OR dest_user_id=?)",
        [aid, bid, bid, aid],
        (error, result) => {
            if (error) return 'na';
            if (!result) return 'nr';
            return result[0].is_approved == 0 ? 'na' : 'a';
        }
    );
};
