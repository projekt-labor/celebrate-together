const express = require('express');
const INDEX_ROUTE = express.Router();

const BASE_TITLE = "Celebrate Together";


// Paths
INDEX_ROUTE.get("/", (req, res) => {
    res.render("index", {
        title: BASE_TITLE
    });
});

module.exports = INDEX_ROUTE;
