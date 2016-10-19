"use strict";

var bluebird, dateService, request, URI;

URI = require("urijs");
bluebird = require("bluebird");
dateService = require("./date-service")();
request = require("request-promise");

/**
 * Creates the main manager object. The main purpose is to inject dependencies.
 *
 * @param {Object} args The args from docopt.
 * @return {manager}
 */
module.exports = (args) => {
    var logger, manager, newArgs, ShelfFile, ShelfMetadata, utils;

    newArgs = require("./arguments")(args);
    logger = require("./logger")(newArgs);

    logger.debug(`Raw args: ${JSON.stringify(args, null, 4)}`);
    logger.debug(`Cleaned args: ${JSON.stringify(newArgs, null, 4)}`);

    logger.debug("Requiring \"./utils\"");
    utils = require("./utils")(dateService, logger, URI);

    logger.debug("Requiring \"./shelf-metadata\"");
    ShelfMetadata = require("./shelf-metadata")(logger, request, utils);

    logger.debug("Requiring \"./shelf-file\"");
    ShelfFile = require("./shelf-file")(logger, request, ShelfMetadata, utils);

    logger.debug("Requiring \"./manager\"");
    manager = require("./manager")(newArgs, bluebird, logger, ShelfFile, utils);

    return manager;
};
