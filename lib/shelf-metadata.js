"use strict";

module.exports = (logger, request, utils) => {
    /**
     * Metadata object for Shelf files.
     */
    class ShelfMetadata {
        /**
         * @param {string} uri The URI for the file we want metadata for.
         * @param {string} authToken The token used to authenticate access.
         */
        constructor(uri, authToken) {
            this.uri = uri;
            this.authToken = authToken;
            this.data = "";
        }

        /**
         * Gets all of a file's metadata.
         *
         * @return {Promise}
         */
        getAll() {
            var options;

            logger.debug("In ShelfMetadata.getAll()");

            options = this.getOptions();

            logger.info(`Getting metadata for ${options.url}`);
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return request.get(options).then((response) => {
                logger.debug("In request.get().then()");

                return utils.handleResponse(response);
            });
        }

        /**
         * Gets one metadata property from the file.
         *
         * @param {string} property The file's metadata property to get.
         * @return {Promise}
         */
        getProperty(property) {
            var options;

            logger.debug("In ShelfMetadata.getProperty()");
            logger.debug(`Property param: ${property}`);

            if (!property) {
                throw new Error("Must provide a property to get.");
            }

            options = this.getOptions(property);

            logger.info(`Getting metadata for ${options.url}`);
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return request.get(options).then((response) => {
                logger.debug("In request.get().then()");

                return utils.handleResponse(response);
            });
        }

        /**
         * Updates the file's metadata. Only updates immutable items.
         *
         * @param {Object} data The data to add to the file's metadata.
         * @return {Promise}
         */
        updateAll(data) {
            var options;

            logger.debug("In ShelfMetadata.updateAll()");
            logger.debug(`Data param: ${data}`);

            if (!data) {
                throw new Error("Must provide data to update.");
            }

            options = this.getOptions();
            options = this.setOptionsData(options, data);

            logger.info(`Updating metadata for ${options.url}`);
            logger.debug(`PUT request options: ${JSON.stringify(options, null, 4)}`);

            return request.put(options).then((response) => {
                logger.debug("In request.put().then()");

                return utils.handleResponse(response);
            });
        }

        /**
         * Updates the file's metadata. Only updates immutable items.
         *
         * @param {string} property The metadata property to update.
         * @param {Object} data The data to add to the file's metadata.
         * @return {Promise}
         */
        updateProperty(property, data) {
            var options;

            logger.debug("In ShelfMetadata.updateProperty()");
            logger.debug(`Property param: ${property}`);
            logger.debug(`Data param: ${data}`);

            if (!property) {
                throw new Error("Must provide a property to update.");
            }

            if (!data) {
                throw new Error("Must provide data to update.");
            }

            options = this.getOptions(property);
            options = this.setOptionsData(options, data);

            logger.info(`Updating metadata for ${options.url}`);
            logger.debug(`PUT request options: ${JSON.stringify(options, null, 4)}`);

            return request.put(options).then((response) => {
                logger.debug("In request.put().then()");

                return utils.handleResponse(response);
            });
        }

        /**
         * Creates metadata on the file.
         *
         * @param {Object} data The metadata object to create on the file.
         */
        /*
        create(data) {
            var options;

            logger.debug("In ShelfMetadata.create()");
            logger.debug(`Data param: ${data}`);

            if (!data) {
                throw new Error("Must provide data to create.");
            }

            options = this.getOptions();
            options = this.setOptionsData(options, data);

            logger.info(`Creating metadata for ${options.url}`);
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            request.post(options, utils.handleResponse);
        }
        */

        /**
         * Creates metadata on the file.
         *
         * @param {string} property The metadata property to create.
         * @param {Object} data The metadata object to create on the file.
         * @return {Promise}
         */
        createProperty(property, data) {
            var options;

            logger.debug("In ShelfMetadata.createProperty()");
            logger.debug(`Property param: ${property}`);
            logger.debug(`Data param: ${data}`);

            if (!property) {
                throw new Error("Must provide a property to create.");
            }

            if (!data) {
                throw new Error("Must provide data to create.");
            }

            options = this.getOptions(property);
            options = this.setOptionsData(options, data);

            logger.info(`Creating metadata for ${options.url}`);
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return request.post(options).then((response) => {
                logger.debug("In request.post().then()");

                return utils.handleResponse(response);
            });
        }

        /**
         * Deletes metadata property on the file.
         *
         * @param {string} property The metadata property to delete.
         * @return {Promise}
         */
        deleteProperty(property) {
            var options;

            logger.debug("In ShelfMetadata.deleteProperty()");
            logger.debug(`Property param: ${property}`);

            if (!property) {
                throw new Error("Must provide a property to delete.");
            }

            options = this.getOptions(property);

            logger.info(`Creating metadata for ${options.url}`);
            logger.debug(`DELETE request options: ${JSON.stringify(options, null, 4)}`);

            return request.delete(options)(options).then((response) => {
                logger.debug("In request.delete().then()");

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
         * @param {string} property Optional file metadata property.
         * @return {Object} options The options object used for requests.
         */
        getOptions(property) {
            var options, url;

            if (property) {
                url = `${this.uri}/_meta/${property}`;
            } else {
                url = `${this.uri}/_meta`;
            }

            // TODO: Remove "rejectUnauthorized: false"
            options = {
                url,
                headers: {
                    Authorization: this.authToken
                },
                resolveWithFullResponse: true,
                simple: false,
                rejectUnauthorized: false
            };

            return options;
        }

        /**
         * @typedef {Object} options
         * @property {string} url
         * @property {Object} headers
         * @property {string} rejectUnathorized
         * @property {Object} body
         * @property {Boolean} json
         */

        /**
         * Sets and returns the options body property with the data added in.
         *
         * @param {Object} options The options object to set the data on.
         * @param {Object} data The data object to set in the request options.
         * @return {Object} options
         */
        setOptionsData(options, data) {
            options.body = data;
            options.json = true;

            return options;
        }
    }

    return ShelfMetadata;
};
