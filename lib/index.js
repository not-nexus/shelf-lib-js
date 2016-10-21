"use strict";

module.exports = (host, logLevel) => {
    var dateService, File, logger, Metadata, Reference, requestPromise, shelfLib, URI, utils;

    // If host doesn't start with "http://" or "https://", throw an error.
    if (!/^http(|s):\/\//.test(host)) {
        throw new Error("Shelf host must start with \"http://\" or \"https://\"");
    }

    shelfLib = {};
    dateService = require("./date-service")();
    logger = require("./logger")(logLevel);
    requestPromise = require("request-promise");
    URI = require("urijs");
    utils = require("./utils")(dateService, logger, URI);
    Metadata = require("./metadata")(logger, requestPromise, utils);
    File = require("./file")(logger, requestPromise, Metadata, utils);
    Reference = require("./reference")(logger, host, requestPromise, File, utils);

    /**
     * Creates and returns a reference with the given refName and token.
     *
     * @param {string} refName
     * @param {token} token
     * @return {Reference}
     */
    shelfLib.getReference = (refName, token) => {
        return new Reference(refName, token);
    };

    return shelfLib;
};
