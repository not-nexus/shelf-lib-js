"use strict";

module.exports = (libOptions, logger) => {
    /**
     * @typedef {Object} headers
     * @property {string} Authroization
     */

    /**
     * @typedef {Object} options
     * @property {headers} headers The header object which holds the
     *                             authorization token to access Shelf.
     * @proptery {boolean} resolveWithFullResponse Get the full response
     *                                             instead of just
     *                                             the body.
     */

    /**
     * Prepares options object for a Shelf request.
     *
     * @param {string} authToken The Shelf access token.
     * @return {options}
     */
    function createOptions(authToken) {
        var options;

        logger.debug("In requestOptions.createOptions()");

        options = {
            headers: {
                Authorization: authToken
            },
            resolveWithFullResponse: true
        };

        // Set the timeout on the request to a minute. The thought
        // behind this is just setting it to something sort of long,
        // in case Shelf is under a large load.
        options.timeout = 60000;

        if (!libOptions.strictHostCheck) {
            options.rejectUnauthorized = false;
        }

        return options;
    }

    return {
        createOptions
    };
};
