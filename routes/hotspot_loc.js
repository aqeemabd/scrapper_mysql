const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("../config");

router.get("/all", (req, res, next) => {
  try {
    const connection = mysql.createConnection(config.db);

    if (connection.state === "disconnected") {
      console.error(`Connection status: Disconnected`);
    }

    connection.query(
      "SELECT * FROM hotspot_loc WHERE latitude IS NULL AND longitude IS NULL",
      async (err, result, fields) => {
        if (err) throw err;
        res.json(await result);
      }
    );
  } catch {
    console.error(`Error while getting hotspot data `, err.message);
    next(err);
  }
});

module.exports = router;
