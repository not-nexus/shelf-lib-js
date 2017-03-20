"use strict";

module.exports = (bluebird, error, logger, responseHandler, ShelfError) => {
    // This regex matches a "=" that isn't preceeded by a "\".
    const searchValidationRegex = /[^\\]=/;

    /**
     * Checks the search query if they contain "\=". If the validation fails,
     * this will return a Promise.reject(). If the validation passes, this will
     * return a Promise.resolve().
     *
     * @param {string} query The search query to be sent to Shelf.
     * @return {Promise.<(string|undefined)>}
     */
    function validateSearchItem(query) {
        logger.debug("In artifact-search.validateSearchItem()");
        logger.debug(`Search query item: ${query}`);

        // Check if each element in the array is a string.
        if (typeof query === "string") {
            // Check each element to make sure they contain a "="
            // that isn't preceeded by a "\".
            if (!searchValidationRegex.test(query)) {
                return bluebird.reject(
                    new ShelfError(`Search query must contain at least one "=" not preceeded by a "\\". Query Provided: ${query}`, error.FAILED_QUERY_VALIDATION)
                );
            }

            return bluebird.resolve();
        }

        return bluebird.reject(new ShelfError("Search query must be a string.", error.FAILED_QUERY_VALIDATION));
    }

    /**
     * Checks the query is either a string or an array of strings and
     * passes each item off to validate individually. This will return
     * Promise.resolve() if all of the elements in the queryList resolve
     * and will return Promise.reject() if any of them are rejected.
     *
     * @param {string|string[]} queryList The search query to be sent to Shelf.
     * @return {Promise.<(string|undefined)>}
     */
    function validateSearch(queryList) {
        logger.debug("In artifact-search.validateSearch()");
        logger.debug(`Search query: ${JSON.stringify(queryList, null, 4)}`);

        // If the queryList is undefined, return a bluebird.resolve(),
        // because empty search queries are supported.
        if (!queryList) {
            return bluebird.resolve();
        }

        // If queryList is not an array, turn it into an array with itself
        // as the only element.
        if (!Array.isArray(queryList)) {
            queryList = [queryList];
        }

        return bluebird.map(queryList, validateSearchItem);
    }


    /**
     * Handles searching for Artifacts.
     */
    class ArtifactSearch {
        /**
         * @param {string} uri
         * @param {shelfLib~ShelfRequest} shelfRequest
         */
        constructor(uri, shelfRequest) {
            this.uri = `${uri}/_search`;
            this.shelfRequest = shelfRequest;
        }


        /**
         * @typedef {Object} searchParameters
         * @property {(string|string[])} [search] A string or array of strings
         *                                        for the search criteria. Can
         *                                        be undefined (optional).
         * @property {(string|string[])} [sort] A string or array of strings
         *                                      for how the results will be
         *                                      sorted. Can be undefined
         *                                      (optional).
         * @property {number} [limit] A number denoting how many results should
         *                            be returned from the search. Can be
         *                            undefined (optional).
         */


        /**
         * Sends and returns a request with the provided search criteria.
         *
         * @param {searchParameters} searchParameters
         * @return {Promise.<string[]>}
         */
        search(searchParameters) {
            logger.debug(`In ${this.constructor.name}.search()`);
            logger.debug(`Search parameters: ${JSON.stringify(searchParameters, null, 4)}`);

            if (!searchParameters) {
                searchParameters = {};
            }

            return validateSearch(searchParameters.search).then(() => {
                return this.shelfRequest.post(this.uri, searchParameters).then((response) => {
                    return responseHandler.resolveLinkHeaders(response);
                });
            });
        }
    }

    return ArtifactSearch;
};
