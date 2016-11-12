"use strict";

module.exports = (bluebird, error, logger, requestOptions, requestPromise, responseHandler) => {
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
         * @typedef {Object} metadataProperty
         * @property {string} value
         * @property {boolean} [immutable]
         */


        /**
         * @typedef {Object} metadataValues
         * @property {metadataProperty} *
         */


        /**
         * Gets all of a artifact's metadata.
         *
         * @return {Promise.<metadataValues>|Error}
         */
        getAll() {
            var options;

            logger.debug(`In ${this.constructor.name}.getAll()`);
            options = requestOptions.createOptions(this.authToken);
            options.json = true;
            options.url = this.uri;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.get(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.getAll() -> request.get().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
                logger.debug(`Status code: ${response.statusCode}`);
                logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);

                return response.body;
            }, (reason) => {
                logger.debug(`In ${this.constructor.name}.getAll() -> request.get().catch()`);
                logger.debug(`Reason: ${JSON.stringify(reason, null, 4)}`);

                // Pass the reason response to the error handler.
                responseHandler.handleErrorResponse(reason);
            });
        }


        /**
         * Gets one metadata property from the artifact.
         *
         * @param {string} name The artifact's metadata property to get.
         * @return {Promise.<metadataProperty>|Error}
         */
        getProperty(name) {
            var options;

            logger.debug(`In ${this.constructor.name}.getProperty()`);
            logger.debug(`Name param: ${name}`);

            if (!name) {
                return bluebird.reject(new Error("Must provide the name for the property to get.", error.INCORRECT_PARAMETERS));
            }

            options = requestOptions.createOptions(this.authToken);
            options.json = true;
            options.url = `${this.uri}/${name}`;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.get(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.getProperty() -> request.get().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
                logger.debug(`Status code: ${response.statusCode}`);
                logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);

                return response.body;
            }, (reason) => {
                logger.debug(`In ${this.constructor.name}.getProperty() -> request.get().catch()`);
                logger.debug(`Reason: ${JSON.stringify(reason, null, 4)}`);

                // Pass the reason response to the error handler.
                responseHandler.handleErrorResponse(reason);
            });
        }


        /**
         * Updates the artifact's metadata and returns the updated metadata.
         * Only updates mutable items.
         *
         * @param {metadataValues} metadata The data to add to the artifact's metadata.
         * @return {Promise.<metadataValues>|Error}
         */
        updateAll(metadata) {
            var options;

            logger.debug(`In ${this.constructor.name}.updateAll()`);
            logger.debug(`Metadata param: ${metadata}`);

            if (!metadata) {
                return bluebird.reject(new Error("Must provide metadata to update.", error.INCORRECT_PARAMETERS));
            }

            options = requestOptions.createOptions(this.authToken);
            options.json = true;
            options.url = this.uri;
            options.body = metadata;
            logger.debug(`PUT request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.put(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.updateAll() -> request.put().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
                logger.debug(`Status code: ${response.statusCode}`);
                logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);

                return response.body;
            }, (reason) => {
                logger.debug(`In ${this.constructor.name}.updateAll() -> request.put().catch()`);
                logger.debug(`Reason: ${JSON.stringify(reason, null, 4)}`);

                // Pass the reason response to the error handler.
                responseHandler.handleErrorResponse(reason);
            });
        }


        /**
         * Updates the artifact's metadata and returns the updated property.
         * Only updates mutable items.
         * If the property doesn't exist, it will be created.
         *
         * @param {string} name The metadata property to update.
         * @param {metadataProperty} property The metadata to update on the artifact.
         * @return {Promise.<metadataProperty>|Error}
         */
        updateProperty(name, property) {
            var options;

            logger.debug(`In ${this.constructor.name}.updateProperty()`);
            logger.debug(`Name param: ${name}, Property param: ${property}`);

            if (!name) {
                return bluebird.reject(new Error("Must provide the name for the property to update.", error.INCORRECT_PARAMETERS));
            }

            if (!property) {
                return bluebird.reject(new Error("Must provide metadata to update.", error.INCORRECT_PARAMETERS));
            }

            options = requestOptions.createOptions(this.authToken);
            options.json = true;
            options.url = `${this.uri}/${name}`;
            options.body = property;
            logger.debug(`PUT request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.put(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.updateProperty() -> request.put().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
                logger.debug(`Status code: ${response.statusCode}`);
                logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);

                return response.body;
            }, (reason) => {
                logger.debug(`In ${this.constructor.name}.updateProperty() -> request.put().catch()`);
                logger.debug(`Reason: ${JSON.stringify(reason, null, 4)}`);

                // Pass the reason response to the error handler.
                responseHandler.handleErrorResponse(reason);
            });
        }


        /**
         * Adds a property to the artifacts metadata and returns the created
         * metadata property.
         *
         * @param {string} name The metadata property to create.
         * @param {metadataProperty} property The metadata to create on the artifact.
         * @return {Promise.<metadataValues>|Error}
         */
        createProperty(name, property) {
            var options;

            logger.debug(`In ${this.constructor.name}.createProperty()`);
            logger.debug(`Name param: ${name}, Property param: ${property}`);

            if (!name) {
                return bluebird.reject(new Error("Must provide a name for the property to create.", error.INCORRECT_PARAMETERS));
            }

            if (!property) {
                return bluebird.reject(new Error("Must provide the property data to set.", error.INCORRECT_PARAMETERS));
            }

            options = requestOptions.createOptions(this.authToken);
            options.json = true;
            options.url = `${this.uri}/${name}`;
            options.body = property;
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.post(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.createProperty() -> request.post().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
                logger.debug(`Status code: ${response.statusCode}`);
                logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);

                return response.body;
            }, (reason) => {
                logger.debug(`In ${this.constructor.name}.createProperty() -> request.post().catch()`);
                logger.debug(`Reason: ${JSON.stringify(reason, null, 4)}`);

                // Pass the reason response to the error handler.
                responseHandler.handleErrorResponse(reason);
            });
        }


        /**
         * Deletes metadata property on the artifact.
         *
         * @param {string} name The metadata property to delete.
         * @return {Promise.<Object>|Error}
         */
        deleteProperty(name) {
            var options;

            logger.debug(`In ${this.constructor.name}.deleteProperty()`);
            logger.debug(`Name param: ${name}`);

            if (!name) {
                return bluebird.reject(new Error("Must provide the name for the property to delete.", error.INCORRECT_PARAMETERS));
            }

            options = requestOptions.createOptions(this.authToken);
            options.json = true;
            options.url = `${this.uri}/${name}`;
            logger.debug(`DELETE request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.delete(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.deleteProperty() -> request.delete().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
                logger.debug(`Status code: ${response.statusCode}`);
                logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);

                return response.body;
            }, (reason) => {
                logger.debug(`In ${this.constructor.name}.deleteProperty() -> request.delete().catch()`);
                logger.debug(`Reason: ${JSON.stringify(reason, null, 4)}`);

                // Pass the reason response to the error handler.
                responseHandler.handleErrorResponse(reason);
            });
        }
    }

    return Metadata;
};
