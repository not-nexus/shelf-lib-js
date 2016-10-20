"use strict";

module.exports = (logger, requestPromise, ShelfMetadata, utils) => {
    /**
     * An object that represents a Shelf artifact.
     */
    class ShelfFile {
        /**
         * @param {string} path The path where this file is located.
         * @param {string} host The URL where the Shelf instance is located.
         * @param {string} uri The full URL we're accessing.
         * @param {string} authToken The token used to authenticate access.
         */
        constructor(path, host, uri, authToken) {
            this.authToken = authToken;
            this.host = host;
            this.metadata = new ShelfMetadata(uri, authToken);
            this.path = path;
            this.uri = uri;
        }


        /**
         * Uploads content to shelf at the provided path.
         *
         * @param {string|ReadStream} content
         * @return {Promise.<Object>}
         */
        upload(content) {
            var options;

            logger.debug("In ShelfFile.upload()");
            options = this.getOptions();
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);
            logger.info(`Uploading to ${options.url}`);
            options.formData = {
                file: {
                    value: content,
                    options: {
                        filename: "file",
                        contentType: "text/plain"
                    }
                }
            };
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.post(options).then((response) => {
                logger.debug("In request.post().then()");

                return utils.handleResponse(response);
            });
        }


        /**
         * Downloads the file at the current path.
         *
         * @return {Promise.<Object>}
         */
        download() {
            var options;

            logger.debug("In ShelfFile.download()");

            options = this.getOptions();

            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);
            logger.info(`Downloading from ${options.url}`);

            return requestPromise.get(options).then((response) => {
                logger.debug("In request.get().then()");

                return utils.handleResponse(response);
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

    return ShelfFile;
};
