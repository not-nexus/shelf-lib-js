"use strict";

module.exports = (dateService, logger, requestOptions, requestPromise, responseHandler, Metadata) => {
    /**
     * Instances of this class represent a Shelf artifact.
     */
    class Artifact {
        /**
         * @param {string} uri The full URL we're accessing.
         * @param {string} authToken The token used to authenticate access.
         */
        constructor(uri, authToken) {
            this.authToken = authToken;
            this.metadata = new Metadata(uri, authToken);
            this.uri = uri;
        }


        /**
         * Uploads content to Shelf at the provided path.
         *
         * @param {(string|ReadStream)} content
         * @return {Promise.<Object>}
         */
        upload(content) {
            var options;

            logger.debug(`In ${this.constructor.name}.upload()`);
            options = requestOptions.createOptions(this.authToken);
            options.url = this.uri;
            options.formData = {
                file: {
                    value: content,
                    options: {
                        filename: "file",
                        contentType: "application/octet-stream"
                    }
                }
            };
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.post(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.upload() -> request.post().then()`);

                return responseHandler.handleArtifactResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }


        /**
         * Uploads content to Shelf at the provided path plus a timestamp.
         *
         * @param {(string|ReadStream)} content
         * @return {Promise.<Object>}
         */
        uploadWithTimestamp(content) {
            var options;

            logger.debug(`In ${this.constructor.name}.upload()`);
            options = requestOptions.createOptions(this.authToken);
            options.url = `${this.uri}/${dateService.now()}`;
            options.formData = {
                file: {
                    value: content,
                    options: {
                        filename: "file",
                        contentType: "application/octet-stream"
                    }
                }
            };
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.post(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.upload() -> request.post().then()`);

                return responseHandler.handleArtifactResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }


        /**
         * Downloads the artifact from the current path.
         *
         * @return {Promise.<Object>}
         */
        download() {
            var options;

            logger.debug(`In ${this.constructor.name}.download()`);
            options = requestOptions.createOptions(this.authToken);
            options.url = this.uri;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.get(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.download() -> request.get().then()`);

                return responseHandler.handleArtifactResponse(response).then((responseObj) => {
                    return responseObj;
                });
            });
        }
    }

    return Artifact;
};
