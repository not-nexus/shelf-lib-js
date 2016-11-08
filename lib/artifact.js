"use strict";

module.exports = (bluebird, fs, logger, request, requestOptions, requestPromise, responseHandler, Metadata) => {
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
                options.url = this.uri;
                logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);
                post = request.post(options, resolver);
                form = post.form();
                form.append("file", content, {
                    filename: "file"
                });
            });

            return promise.then((response) => {
                return response.headers.location;
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
            var options;

            logger.debug(`In ${this.constructor.name}.uploadFromFile()`);

            if (typeof file === "string") {
                file = fs.createReadStream(file);
            }

            options = requestOptions.createOptions(this.authToken);
            options.url = this.uri;
            logger.debug(`POST request options: ${JSON.stringify(options, null, 4)}`);
            options.formData = {
                file
            };

            return new Promise((resolve, reject) => {
                request.post(options, (err, res, body) => {
                    logger.debug(err, res.statusCode, body);

                    // TODO: Actually do error handling
                    if (res.statusCode >= 400) {
                        return reject(new Error("Received HTTP error code"));
                    }

                    return resolve(file.path.toString());
                });
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
            options.url = this.uri;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return requestPromise.get(options).then((response) => {
                logger.debug(`In ${this.constructor.name}.download() -> request.get().then()`);

                return responseHandler.handleArtifactResponse(response).then((content) => {
                    return content;
                });
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
         * @return {Promise.<string>}
         */
        downloadToFile(downloadLocation) {
            var options;

            logger.debug(`In ${this.constructor.name}.downloadToFile()`);

            if (typeof downloadLocation === "string") {
                downloadLocation = fs.createWriteStream(downloadLocation);
            }

            options = requestOptions.createOptions(this.authToken);
            options.url = this.uri;
            logger.debug(`GET request options: ${JSON.stringify(options, null, 4)}`);

            return new Promise((resolve, reject) => {
                request
                    .get(options)
                    .on("response", (response) => {
                        logger.debug(response.statusCode);

                        // TODO: Actually handle errors.
                        if (response.statusCode === 404) {
                            reject(new Error("Response was 404"));
                        }

                        response
                            .pipe(downloadLocation)
                            .on("error", (err) => {
                                return bluebird.reject(new Error(err));
                            })
                            .on("finish", () => {
                                logger.debug("Finished piping.");

                                // WriteStream.path can return a Buffer, so let's toString() it
                                // just in case.
                                return resolve(downloadLocation.path.toString());
                            });
                    });
            });
        }
    }

    return Artifact;
};
