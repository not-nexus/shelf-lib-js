"use strict";

var Log;

Log = require("log");

module.exports = (args) => {
    var logger, logLevel;

    logLevel = "info";

    if (args.verbose) {
        logLevel = "debug";
    }

    logger = new Log(logLevel);

    return logger;
};
