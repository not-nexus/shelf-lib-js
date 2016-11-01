"use strict";

module.exports = (bluebird, logger, requestOptions, requestPromise, responseHandler, URI) => {
    /**
     * Checks the query is either a string or an array of strings and
     * checks the string (or strings) if they contain "\=". If any of
     * Those checks fail, this will return a Promise.reject(). If all the
     * checks pass, this will return a Promise.resolve().
     *
     * @param {string} query The search query to be sent to Shelf.
     * @return {Promise.<(string|undefined)>}
     */
    function validateSearch(query) {
        var validationTestStr;

        logger.debug("In artifact-search.validateSearch()");
        validationTestStr = "=";

        // Check if the query is an array of strings or a string.
        if (Array.isArray(query)) {
            return bluebird.map(query, (val) => {
                // Check if each element in the array is a string.
                if (typeof val === "string") {
                    // Check each element to make sure they contain a =.
                    if (val.indexOf(validationTestStr) === -1) {
                        return bluebird.reject(new Error("Search query must contain at least one \"=\""));
                    }

                    return bluebird.resolve();
                }

                return bluebird.reject(new Error("Search query must be a string or an array of strings"));
            });
        } else if (typeof query === "string") {
            // Check the query to make sure it contains a =.
            if (query.indexOf(validationTestStr) === -1) {
                return bluebird.reject(new Error("Search query must contain at least one \"=\""));
            }

            return bluebird.resolve();
        }

        return bluebird.reject(new Error("Search query must be a string or an array of strings"));
    }

    /**
     * Handles searching for Artifacts.
     */
    class ArtifactSearch {
        /**
         * @param {string} host The host where Shelf is located.
         * @param {string} refName The reference name to access.
         * @param {string} path The path to search on Shelf.
         * @param {string} authToken The authorization token for Shelf.
         */
        constructor(host, refName, path, authToken) {
            this.host = host;
            this.refName = refName;
            this.path = path;
            this.authToken = authToken;
        }


        /**
         * Sends and returns a request with the provided search criteria.
         *
         * @param {(string|string[])} search A string or array of strings for
         *                                   the search criteria.
         * @param {(string|string[])} sort A string or array of strings for
         *                                 how the results will be sorted.
         * @return {Promise.<Object>}
         */
        search(search, sort) {
            var options;

            logger.debug(`In ${this.constructor.name}.search()`);
            options = requestOptions.createOptions(this.authToken);
            options.url = new URI(this.host)
                    .path(`${this.refName}/artifact/${this.path}/_search`)
                    .toString();
            options.body = {
                search,
                sort
            };
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return validateSearch(search).then(() => {
                return requestPromise.post(options).then((response) => {
                    logger.debug(`In ${this.constructor.name}.search() -> request.get().then()`);

                    return responseHandler.handleArtifactSearchResponse(response).then((linkList) => {
                        return linkList;
                    });
                });
            });
        }
    }

    return ArtifactSearch;
};
