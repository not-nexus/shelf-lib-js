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
     * @property {boolean} json Sets the body of the request to JSON.
     * @proptery {boolean} resolveWithFullResponse Get the full response
     *                                             instead of just
     *                                             the body.
     * @property {boolean} simple Get a rejection only if the request
     *                            failed for technical reasons.
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
            json: true,
            resolveWithFullResponse: true,
            simple: false
        };

        if (!libOptions.strictHostCheck) {
            options.rejectUnauthorized = false;
        }

        return options;
    }

    return {
        createOptions
    };
};
