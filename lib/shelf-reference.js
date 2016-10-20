"use strict";

module.exports = (logger, host, requestPromise, ShelfFile, utils) => {
    /**
     * A reference to a Shelf bucket.
     */
    class ShelfReference {
        /**
         * @param {string} refName
         * @param {string} authToken
         */
        constructor(refName, authToken) {
            this.authToken = authToken;
            this.refName = refName;
        }


        /**
         * Creates and returns a ShelfFile at the given path.
         *
         * @param {string} path
         * @param {Boolean} unique Denotes if the uploaded content should have
         *                         a unique url.
         * @return {ShelfFile}
         */
        getArtifact(path, unique) {
            var uri;

            logger.debug("In ShelfReference.getArtifact()");
            uri = utils.buildUrl(path, host, this.refName, unique);

            return new ShelfFile(path, host, uri, this.authToken);
        }


        /**
         * Sends and returns a request with the provided search criteria.
         *
         * @param {string} pathToSearch The path to perform the search on.
         * @param {string} search The search criteria.
         * @param {(string|string[])} sort A string or array of strings for
         *                                 how the results will be sorted.
         * @return {Promise.<Object>}
         */
        search(pathToSearch, search, sort) {
            var options, url;

            logger.debug("In ShelfReference.search()");

            url = utils.buildUrl(pathToSearch, host, this.refName);
            options = this.getOptions();
            options.url = `${url}/_search`;
            options.body = {
                search,
                sort
            };
            options.json = true;
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.post(options).then((response) => {
                var requestObj;

                logger.debug("In request.get().then()");
                requestObj = utils.handleResponse(response);

                // Modify the links array to make ShelfFile objects from
                // the links.
                requestObj.links.forEach((val, index) => {
                    var path, uri;

                    path = val.replace(/.*artifact\//g, "");
                    uri = utils.buildUrl(path, host, this.refName);
                    requestObj.links[index] = new ShelfFile(path, host, uri, this.authToken);
                    logger.debug(`Created new ShelfFile from link: ${JSON.stringify(requestObj.links[index], null, 4)}`);
                });

                return requestObj;
            });
        }


        /**
         * @typedef {Object} options
         * @property {string} url
         * @property {Object} headers
         * @proptery {Boolean} resolveWithFullResponse
         * @property {Boolean} simple
         * @property {string} rejectUnathorized
         */

        /**
         * Creates and returns the options for requests.
         *
         * @return {Object} options The options object used for requests.
         */
        getOptions() {
            var options;

            // NOTE: If you are using this library with Shelf with a self
            // signed certificate, you will need to add the property
            // "rejectUnauthorized: false" to this options object.
            options = {
                url: this.uri,
                headers: {
                    Authorization: this.authToken
                },
                resolveWithFullResponse: true,
                simple: false
            };

            return options;
        }
    }

    return ShelfReference;
};
