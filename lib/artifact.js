"use strict";

module.exports = (bluebird, fs, logger, request, requestOptions, requestPromise, responseHandler, Metadata) => {
    var Bluebird;

    // Used in order to make the linter happy when creating new Bluebird
    // promises.
    Bluebird = bluebird;

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
         * Uploads content to Shelf at the path this artifact was
         * initialized with.
         *
         * @param {string} content
         * @return {Promise.<string>} location The URL the artifact was
         *                                     uploaded to.
         */
        upload(content) {
            var promise;

            logger.debug(`In ${this.constructor.name}.upload()`);
            promise = bluebird.fromCallback((resolver) => {
                var form, options, post;

                options = requestOptions.createOptions(this.authToken);
                options.json = true;
                options.url = this.uri;
                logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);
                post = request.post(options, resolver);
                form = post.form();
                form.append("file", content, {
                    filename: "file"
                });
            });

            return promise.then((response) => {
                logger.debug(`In ${this.constructor.name}.upload() -> request.post().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);

                if (responseHandler.isErrorCode(response.statusCode)) {
                    responseHandler.handleErrorResponse(response);
                }

                return responseHandler.resolveLink(this.uri, response.headers.location);
            });
        }


        /**
         * Uploads the given file to Shelf at the path this artifact was
         * initialized with. If the parameter is a string, it will be treated
         * as a local file system path, and will turn that path into a
         * ReadStream. If the parameter is a ReadStream, it will be used
         * directly.
         *
         * @param {(string|ReadStream)} file
         * @return {Promise.<string>}
         */
        uploadFromFile(file) {
            var promise;

            logger.debug(`In ${this.constructor.name}.uploadFromFile()`);
            promise = bluebird.fromCallback((resolver) => {
                var options;

                if (typeof file === "string") {
                    file = fs.createReadStream(file);
                }

                options = requestOptions.createOptions(this.authToken);
                options.json = true;
                options.url = this.uri;
                options.formData = {
                    file
                };
                logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);
                request.post(options, resolver);
            });

            return promise.then((response) => {
                logger.debug(`In ${this.constructor.name}.uploadFromFile() -> request.post().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);

                if (responseHandler.isErrorCode(response.statusCode)) {
                    responseHandler.handleErrorResponse(response);
                }

                return responseHandler.resolveLink(this.uri, response.headers.location);
            });
        }


        /**
         * Downloads the artifact from the path this artifact was
         * initialized with and returns the content in a variable.
         *
         * @return {Promise.<Object>}
         */
        download() {
            var options;

            logger.debug(`In ${this.constructor.name}.download()`);
            options = requestOptions.createOptions(this.authToken);
            options.json = true;
            options.url = this.uri;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.get(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.download() -> request.get().then()`);
                logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
                logger.debug(`Status code: ${response.statusCode}`);

                return response.body;
            }, (reason) => {
                logger.debug(`In ${this.constructor.name}.download() -> request.get().catch()`);
                logger.debug(`Reason: ${JSON.stringify(reason, null, 4)}`);

                responseHandler.handleErrorResponse(reason);
            });
        }


        /**
         * Downloads the artifact from the path this artifact was
         * initialized with to a file. The user can pass in either a string
         * containing a path in their local file system, or a WriteStream to
         * pipe the data to. Returns the path the artifact was downloaded to.
         *
         * @param {(string|WriteStream)} downloadLocation The local file system
         *                                              path or WriteStream to
         *                                              save the artifact to.
         * @return {Promise.<string|undefined>}
         */
        downloadToFile(downloadLocation) {
            var errorObj, options;

            logger.debug(`In ${this.constructor.name}.downloadToFile()`);

            if (typeof downloadLocation === "string") {
                downloadLocation = fs.createWriteStream(downloadLocation);
            }

            options = requestOptions.createOptions(this.authToken);
            options.json = true;
            options.url = this.uri;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return new Bluebird((resolve, reject) => {
                return request
                    .get(options)
                    .on("response", (response) => {
                        logger.debug(`In ${this.constructor.name}.downloadToFile() -> request.on("response")`);
                        logger.debug(`Status code: ${response.statusCode}`);

                        if (responseHandler.isErrorCode(response.statusCode)) {
                            errorObj = responseHandler.createErrorForResponse(response);

                            return reject(errorObj);
                        }

                        return response
                            .pipe(downloadLocation)
                            .on("error", (err) => {
                                logger.debug(`In ${this.constructor.name}.downloadToFile() -> request.on("response").pipe().on("error)`);
                                errorObj = responseHandler.createErrorForResponse(err);

                                return reject(errorObj);
                            })
                            .on("finish", () => {
                                logger.debug(`In ${this.constructor.name}.downloadToFile() -> request.on("response").on("finish")`);

                                return resolve();
                            });
                    })
                    .on("error", (err) => {
                        logger.debug(`In ${this.constructor.name}.downloadToFile() -> request.on("response").on("error)`);
                        errorObj = responseHandler.createErrorForResponse(err);

                        return reject(errorObj);
                    });
            });
        }
    }

    return Artifact;
};
