"use strict";

module.exports = (host, libOptions) => {
    var container, error, logger, Reference, shelfLib;

    // If host doesn't start with "http://" or "https://", throw an error.
    if (!/^http(|s):\/\//.test(host)) {
        throw new Error("Shelf host must start with \"http://\" or \"https://\"");
    }

    // libOptions is set to an empty object by defualt.
    // The user may supply additional options as needed.
    if (!libOptions) {
        libOptions = {};
    }

    // strictHostCheck is set to true by default.
    // If the user would not like the library to check the certificate
    // during requests, this would be set to false.
    if (typeof libOptions.strictHostCheck === "undefined") {
        libOptions.strictHostCheck = true;
    }

    // logLevel is set to warning by default.
    // This keeps the detail to identified problems only.
    // If more detail is required use "info" instead.
    // Use "debug" only if you would like extremely verbose output.
    if (!libOptions.logLevel) {
        libOptions.logLevel = "warning";
    }

    // timeoutDuration is set to 60000 (one minute) by default. The thought
    // behind this is just setting it to something sort of long,
    // in case Shelf is under a large load.
    // If it is set, it will overrides the default timeout time.
    if (!libOptions.timeoutDuration) {
        libOptions.timeoutDuration = 60000;
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
        logger.debug("In shelfLib.initReference()");

        return new Reference(refName, token);
    };

    return shelfLib;
};
