"use strict";

module.exports = (host, libOptions) => {
    var container, error, logger, Reference, shelfLib;

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

    // Load the dependency injection container.
    container = require("./container")(host, libOptions);
    logger = container.resolve("logger");
    error = container.resolve("error");
    Reference = container.resolve("Reference");
    shelfLib = {};
    shelfLib.error = error;


    /**
     * Creates and returns a reference with the given refName and token.
     *
     * @param {string} refName
     * @param {token} token
     * @return {Reference}
     */
    shelfLib.initReference = (refName, token) => {
        console.log(logger);
        logger.debug("In shelfLib.createReference()");

        return new Reference(refName, token);
    };

    return shelfLib;
};
