"use strict";

module.exports = (logger, libOptions) => {
    var requestOptions;

    requestOptions = {};
    //TODO Why this structure?

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
     * Creates and returns a requestOptions object with the Authorization
     * header set with the authToken, json and resolveWithFullResponse set to
     * true, simple set to false, and if the user set strictHostCheck to false,
     * sets rejectUnauthorized to false.
     *
     * @param {string} authToken The Shelf access token.
     * @return {options}
     */
    requestOptions.createOptions = (authToken) => {
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
    };

    return requestOptions;
};
