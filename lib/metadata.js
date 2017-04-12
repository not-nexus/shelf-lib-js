"use strict";

module.exports = (bluebird, concatUri, error, logger, ShelfError) => {
    /**
     * Metadata object for Shelf artifacts.
     */
    class Metadata {
        /**
         * @param {string} uri The URI for the artifact we want metadata for.
         * @param {shelfLib~ShelfRequest} shelfRequest
         */
        constructor(uri, shelfRequest) {
            this.shelfRequest = shelfRequest;
            this.uri = concatUri(uri, "_meta");
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
         * Does a get and returns the response body.
         *
         * @private
         * @param {string} uri
         * @return {Promise.<Object>}
         */
        getBody(uri) {
            return this.shelfRequest.get(uri).then((response) => {
                return response.body;
            });
        }


        /**
         * Gets all of a artifact's metadata.
         *
         * @return {Promise.<metadataValues>}
         */
        getAll() {
            logger.debug(`In ${this.constructor.name}.getAll()`);

            return this.getBody(this.uri);
        }


        /**
         * Gets one metadata property from the artifact.
         *
         * @param {string} name The artifact's metadata property to get.
         * @return {Promise.<metadataProperty>}
         */
        getProperty(name) {
            var uri;

            if (!name) {
                return bluebird.reject(new ShelfError("Must provide the name for the property to get.", error.INCORRECT_PARAMETERS));
            }

            logger.debug(`In ${this.constructor.name}.getProperty()`);
            logger.debug(`Name param: ${name}`);
            uri = `${this.uri}/${name}`;

            return this.getBody(uri);
        }


        /**
         * Updates the artifact's metadata and returns the updated metadata.
         * Only updates mutable items.
         *
         * @param {metadataValues} metadata The data to add to the artifact's metadata.
         * @return {Promise.<metadataValues>}
         */
        updateAll(metadata) {
            logger.debug(`In ${this.constructor.name}.updateAll()`);
            logger.debug(`Metadata param: ${metadata}`);

            if (!metadata) {
                return bluebird.reject(new ShelfError("Must provide metadata to update.", error.INCORRECT_PARAMETERS));
            }

            return this.shelfRequest.put(this.uri, metadata).then((response) => {
                return response.body;
            });
        }


        /**
         * Updates the artifact's metadata and returns the updated property.
         * Only updates mutable items.
         * If the property doesn't exist, it will be created.
         *
         * @param {string} name The metadata property to update.
         * @param {metadataProperty} property The metadata to update on the artifact.
         * @return {Promise.<metadataProperty>}
         */
        updateProperty(name, property) {
            var uri;

            logger.debug(`In ${this.constructor.name}.updateProperty()`);
            logger.debug(`Name param: ${name}, Property param: ${property}`);

            if (!name) {
                return bluebird.reject(new ShelfError("Must provide the name for the property to update.", error.INCORRECT_PARAMETERS));
            }

            if (!property) {
                return bluebird.reject(new ShelfError("Must provide metadata to update.", error.INCORRECT_PARAMETERS));
            }

            uri = `${this.uri}/${name}`;

            return this.shelfRequest.put(uri, property).then((response) => {
                return response.body;
            });
        }


        /**
         * Adds a property to the artifacts metadata and returns the created
         * metadata property.
         *
         * @param {string} name The metadata property to create.
         * @param {metadataProperty} property The metadata to create on the artifact.
         * @return {Promise.<metadataProperty>}
         */
        createProperty(name, property) {
            var uri;

            logger.debug(`In ${this.constructor.name}.createProperty()`);
            logger.debug(`Name param: ${name}, Property param: ${property}`);

            if (!name) {
                return bluebird.reject(new ShelfError("Must provide a name for the property to create.", error.INCORRECT_PARAMETERS));
            }

            if (!property) {
                return bluebird.reject(new ShelfError("Must provide the property data to set.", error.INCORRECT_PARAMETERS));
            }

            uri = `${this.uri}/${name}`;

            return this.shelfRequest.post(uri, property).then((response) => {
                return response.body;
            });
        }


        /**
         * Deletes metadata property on the artifact.
         *
         * @param {string} name The metadata property to delete.
         * @return {Promise.<undefined>}
         */
        deleteProperty(name) {
            var uri;

            logger.debug(`In ${this.constructor.name}.deleteProperty()`);
            logger.debug(`Name param: ${name}`);

            if (!name) {
                return bluebird.reject(new ShelfError("Must provide the name for the property to delete.", error.INCORRECT_PARAMETERS));
            }

            uri = `${this.uri}/${name}`;

            return this.shelfRequest.delete(uri).then(() => {
                // Intentially empty so we don't resolve with a response.
            });
        }
    }

    return Metadata;
};
