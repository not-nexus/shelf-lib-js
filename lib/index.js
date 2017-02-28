"use strict";
var error, ShelfError;

ShelfError = require("./shelf-error")();
error = require("./error")();

/**
 * @typedef {Object} shelfLib
 * @property {initReference} initReference
 */

/**
 * @typedef {Function} initReference
 * @param {string} refName - The reference name is how to refer to a
 * storage space.
 * @param {string} token - The shelf authentication token.
 * @return {Reference}
 */

/**
 * Factory for creating a shelf library. It is specific to a host
 * and a few other configuration options.
 *
 * @property {ShelfError} ShelfError
 * @property {lib/error} error
 * @param {string} hostPrefix - The combination of the protocol and the host.
 * @param {Object} libOptions
 * @return {shelfLib}
 */
function shelfLibFactory(hostPrefix, libOptions) {
    var container, logger, Reference, shelfLib;

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

    // timeoutDuration is set to 300000 (five minute) by default. The thought
    // behind this is just setting it to something sort of long,
    // in case Shelf is under a large load.
    // If it is set, it will overrides the default timeout time.
    if (!libOptions.timeoutDuration) {
        libOptions.timeoutDuration = 300000;
    }

    // Load the dependency injection container.
    container = require("./container")(error, hostPrefix, ShelfError, libOptions);

    // If host doesn't start with "http://" or "https://", throw an error.
    if (!/^http(|s):\/\//.test(hostPrefix)) {
        throw new ShelfError("Shelf host must start with \"http://\" or \"https://\"", error.INVALID_HOST_PREFIX);
    }

    logger = container.resolve("logger");
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
}

shelfLibFactory.ShelfError = ShelfError;
shelfLibFactory.error = error;
module.exports = shelfLibFactory;
