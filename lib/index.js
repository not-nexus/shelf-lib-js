"use strict";

module.exports = (host, libOptions) => {
    var Artifact, ArtifactSearch, dateService, logger, Metadata, parseLinkHeader, Reference, requestOptions, requestPromise, responseHandler, shelfLib, URI;

    // If host doesn't start with "http://" or "https://", throw an error.
    if (!/^http(|s):\/\//.test(host)) {
        throw new Error("Shelf host must start with \"http://\" or \"https://\"");
    }

    // If libOptions is undefined, set it to an empty object.
    if (!libOptions) {
        libOptions = {};
    }

    // If libOptions.strictHostCheck is undefined, set it to true.
    if (typeof libOptions.strictHostCheck === "undefined") {
        libOptions.strictHostCheck = true;
    }

    // If libOptions.logLevel is undefined, set it to "warning".
    if (!libOptions.logLevel) {
        libOptions.logLevel = "warning";
    }

    shelfLib = {};
    dateService = require("./date-service")();
    logger = require("./logger")(libOptions.logLevel);
    parseLinkHeader = require("parse-link-header");
    requestPromise = require("request-promise-native");
    URI = require("urijs");
    requestOptions = require("./request-options")(logger, libOptions);
    responseHandler = require("./response-handler")(logger, parseLinkHeader);
    Metadata = require("./metadata")(logger, requestOptions, requestPromise, responseHandler);
    Artifact = require("./artifact")(dateService, logger, requestOptions, requestPromise, responseHandler, Metadata);
    ArtifactSearch = require("./artifact-search")(logger, requestOptions, requestPromise, responseHandler, URI);
    Reference = require("./reference")(Artifact, ArtifactSearch, logger, host, requestPromise, URI);

    /**
     * Creates and returns a reference with the given refName and token.
     *
     * @param {string} refName
     * @param {token} token
     * @return {Reference}
     */
    shelfLib.initReference = (refName, token) => {
        logger.debug("In shelfLib.createReference()");

        return new Reference(refName, token);
    };

    return shelfLib;
};
