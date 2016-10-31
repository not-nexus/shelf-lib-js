"use strict";

module.exports = (logger, requestOptions, requestPromise, responseHandler, URI) => {
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
            var options, url;

            logger.debug(`In ${this.constructor.name}.search()`);
            this.validateSearch(search);
            url = new URI(this.host)
                    .path(`${this.refName}/artifact/${this.path}`)
                    .toString();
            options = requestOptions.createOptions(this.authToken);
            options.url = `${url}/_search`;
            options.body = {
                search,
                sort
            };
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.post(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.search() -> request.get().then()`);

                return responseHandler.handleArtifactSearchResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }


        /**
         * Checks the query is either a string or an array of strings and
         * checks the string (or strings) if they contain "\=". If any of
         * those checks fail, this will do a Promise.reject(). If all the
         * checks pass, this will do nothing.
         *
         * @param {string} query The search query to be sent to Shelf.
         */
        validateSearch(query) {
            var validationTestStr;

            logger.debug(`In ${this.constructor.name}.validateSearch()`);
            validationTestStr = "\\=";

            // Check if the query is an array of strings or a string.
            if (Array.isArray(query)) {
                query.forEach((val) => {
                    // Check if each element in the array is a string.
                    if (typeof val === "string") {
                        // Check each element if they contain "\=".
                        if (val.indexOf(validationTestStr) > -1) {
                            Promise.reject("Search query can't contain \"\\=\"");
                        }
                    } else {
                        Promise.reject("Search query must be a string or an array of strings");
                    }
                });
            } else if (typeof query === "string") {
                // Check if the query contains "\=".
                if (query.indexOf(validationTestStr) > -1) {
                    Promise.reject("Search query can't contain \"\\=\"");
                }
            } else {
                Promise.reject("Search query must be a string or an array of strings");
            }
        }
    }

    return ArtifactSearch;
};
