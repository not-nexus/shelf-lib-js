"use strict";

module.exports = (logger, requestOptions, requestPromise, responseHandler) => {
    /**
     * Metadata object for Shelf artifacts.
     */
    class Metadata {
        /**
         * @param {string} uri The URI for the artifact we want metadata for.
         * @param {string} authToken The token used to authenticate access.
         */
        constructor(uri, authToken) {
            this.authToken = authToken;
            this.data = "";
            this.uri = `${uri}/_meta`;
        }


        /**
         * Gets all of a artifact's metadata.
         *
         * @return {Promise.<Object>}
         */
        getAll() {
            var options;

            logger.debug(`In ${this.constructor.name}.getAll()`);
            options = requestOptions.createOptions(this.authToken);
            options.url = this.uri;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.get(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.getAll() -> request.get().then()`);

                return responseHandler.handleMetadataResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }


        /**
         * Gets one metadata property from the artifact.
         *
         * @param {string} name The artifact's metadata property to get.
         * @return {Promise.<Object>}
         */
        getProperty(name) {
            var options;

            logger.debug(`In ${this.constructor.name}.getProperty()`);
            logger.debug(`Name param: ${name}`);

            if (!name) {
                return Promise.reject("Must provide the name for the property to get.");
            }

            options = requestOptions.createOptions(this.authToken);
            options.url = `${this.uri}/${name}`;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.get(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.getProperty() -> request.get().then()`);

                return responseHandler.handleMetadataResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }


        /**
         * Updates the artifact's metadata. Only updates mutable items.
         *
         * @param {Object} metadata The data to add to the artifact's metadata.
         * @return {Promise.<Object>}
         */
        updateAll(metadata) {
            var options;

            logger.debug(`In ${this.constructor.name}.updateAll()`);
            logger.debug(`Metadata param: ${metadata}`);

            if (!metadata) {
                return Promise.reject("Must provide metadata to update.");
            }

            options = requestOptions.createOptions(this.authToken);
            options.url = this.uri;
            options.body = metadata;
            logger.debug(`PUT request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.put(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.updateAll() -> request.put().then()`);

                return responseHandler.handleMetadataResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }


        /**
         * Updates the artifact's metadata. Only updates mutable items.
         * If the property doesn't exist, it will be created.
         *
         * @param {string} name The metadata property to update.
         * @param {Object} property The metadata to update on the artifact.
         * @return {Promise.<Object>}
         */
        updateProperty(name, property) {
            var options;

            logger.debug(`In ${this.constructor.name}.updateProperty()`);
            logger.debug(`Name param: ${name}`);
            logger.debug(`Property param: ${property}`);

            if (!name) {
                return Promise.reject("Must provide the name for the property to update.");
            }

            if (!property) {
                return Promise.reject("Must provide metadata to update.");
            }

            options = requestOptions.createOptions(this.authToken);
            options.url = `${this.uri}/${name}`;
            options.body = property;
            logger.debug(`PUT request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.put(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.updateProperty() -> request.put().then()`);

                return responseHandler.handleMetadataResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }


        /**
         * Creates metadata on the artifact.
         *
         * @param {string} name The metadata property to create.
         * @param {Object} property The metadata to create on the artifact.
         * @return {Promise.<Object>}
         */
        createProperty(name, property) {
            var options;

            logger.debug(`In ${this.constructor.name}.createProperty()`);
            logger.debug(`Name param: ${name}`);
            logger.debug(`Property param: ${property}`);

            if (!name) {
                return Promise.reject("Must provide a name for the property to create.");
            }

            if (!property) {
                return Promise.reject("Must provide the property data to set.");
            }

            options = requestOptions.createOptions(this.authToken);
            options.url = `${this.uri}/${name}`;
            options.body = property;
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.post(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.createProperty() -> request.post().then()`);

                return responseHandler.handleMetadataResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }


        /**
         * Deletes metadata property on the artifact.
         *
         * @param {string} name The metadata property to delete.
         * @return {Promise.<Object>}
         */
        deleteProperty(name) {
            var options;

            logger.debug(`In ${this.constructor.name}.deleteProperty()`);
            logger.debug(`Name param: ${name}`);

            if (!name) {
                return Promise.reject("Must provide the name for the property to delete.");
            }

            options = requestOptions.createOptions(this.authToken);
            options.url = `${this.uri}/${name}`;
            logger.debug(`DELETE request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.delete(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.deleteProperty() -> request.delete().then()`);

                return responseHandler.handleMetadataResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }
    }

    return Metadata;
};
