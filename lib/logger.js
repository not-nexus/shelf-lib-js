"use strict";

var Log;

Log = require("log");

module.exports = (ExtendedError, logLevel) => {
    var logger, logLevelList;

    logLevelList = ["info", "debug", "warning"];

    if (!logLevel) {
        logLevel = "warning";
    }

    if (logLevelList.indexOf(logLevel) > -1) {
        logger = new Log(logLevel);

        if (logLevel === "debug") {
            logger.debug("WARNING: The DEBUG log level will log out your Shelf authentication token! Log at your peril.");
        }
    } else {
        throw new ExtendedError("Invalid log level.");
    }

    return logger;
};
