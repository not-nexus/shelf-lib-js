"use strict";

module.exports = (host) => {
    var dateService, logger, requestPromise, ShelfFile, shelfLib, ShelfMetadata, ShelfReference, URI, utils;

    shelfLib = {};
    dateService = require("./date-service")();
    logger = require("./logger")({
        verbose: true
    });
    requestPromise = require("request-promise");
    URI = require("urijs");
    utils = require("./utils")(dateService, logger, URI);
    ShelfMetadata = require("./shelf-metadata")(logger, requestPromise, utils);
    ShelfFile = require("./shelf-file")(logger, requestPromise, ShelfMetadata, utils);
    ShelfReference = require("./shelf-reference")(logger, host, requestPromise, ShelfFile, utils);

    /**
     * @param {string} refName
     * @param {token} token
     * @return {ShelfReference}
     */
    shelfLib.reference = (refName, token) => {
        return new ShelfReference(refName, token);
    };

    return shelfLib;
};
