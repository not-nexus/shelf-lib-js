"use strict";

module.exports = (libOptions, logger) => {
    /**
     * @typedef {Object} options
     * @property {Boolean} json Sets the body of the request to JSON.
     * @proptery {Boolean} resolveWithFullResponse Get the full response
     *                                             instead of just
     *                                             the body.
     * @property {Boolean} simple Get a rejection only if the request
     *                            failed for technical reasons.
     */

    /**
     * Preps options object for a Shelf request.
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
