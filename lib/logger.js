"use strict";

var Log;

Log = require("log");

module.exports = (logLevel) => {
    var logger, logLevels;

    logLevels = ["info", "verbose", "warning"];

    if (!logLevel) {
        logLevel = "warning";
    }

    if (logLevels.indexOf(logLevel) > -1) {
        logger = new Log(logLevel);
    } else {
        throw new Error("Invalid log level.");
    }

    return logger;
};
