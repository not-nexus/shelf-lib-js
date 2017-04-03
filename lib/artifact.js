"use strict";

module.exports = (fsAsync, logger, responseHandler, Metadata) => {
    /**
     * Instances of this class represent a Shelf artifact.
     */
    class Artifact {
        /**
         * @param {string} uri The full URL we're accessing.
         * @param {shelfLib~ShelfRequest} shelfRequest
         */
        constructor(uri, shelfRequest) {
            this.shelfRequest = shelfRequest;
            this.metadata = new Metadata(uri, shelfRequest);
            this.uri = uri;
        }


        /**
         * Uploads content to Shelf at the path this artifact was
         * initialized with.
         *
         * @param {(string|Buffer|stream.Readable)} content
         * @return {Promise.<string>} location The URL the artifact was
         *                                     uploaded to.
         */
        upload(content) {
            if (typeof content === "string") {
                // Buffer.from not supported in v4
                content = new Buffer(content);
            }

            return this.shelfRequest.upload(this.uri, content).then((response) => {
                return responseHandler.resolveLink(this.uri, response.header.location);
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
            logger.debug(`In ${this.constructor.name}.uploadFromFile()`);

            if (typeof file === "string") {
                file = fsAsync.createReadStream(file);
            }

            return this.upload(file);
        }


        /**
         * Downloads the artifact from the path this artifact was
         * initialized with and returns the content in a variable.
         *
         * NOTE: Do not use this for large files. By default nodes
         * max memory size is 1.76GB (for 64 bit systems). This will
         * blow up if your artifact is approaching that size.
         *
         * @see {shelfLib~Artifact.downloadToFile}
         *
         * @return {Promise.<Object>}
         */
        download() {
            logger.debug(`In ${this.constructor.name}.download()`);

            return this.shelfRequest.get(this.uri).then((response) => {
                /*
                 * In the future we should return a buffer instead of a
                 * utf8 encoded string. I am only doing this here now
                 * because the change is unrelated to the feature I
                 * am working on right now and I don't want to try to
                 * sneak in something that breaks the interface that bad.
                 */
                return response.body.toString("utf8");
            });
        }


        /**
         * Downloads the artifact from the path this artifact was
         * initialized with to a file. The user can pass in either a string
         * containing a path in their local file system, or a WriteStream to
         * pipe the data to. Returns the path the artifact was downloaded to.
         * If a file path is passed in and an error response occurs it cleans
         * up any residual file. We do not do this if a stream is passed in.
         *
         * @param {(string|WriteStream)} downloadLocation The local file system
         *                                              path or WriteStream to
         *                                              save the artifact to.
         * @return {Promise.<undefined>}
         */
        downloadToFile(downloadLocation) {
            var promise, saveTo;

            logger.debug(`In ${this.constructor.name}.downloadToFile()`);

            if (typeof downloadLocation === "string") {
                saveTo = downloadLocation;
                downloadLocation = fsAsync.createWriteStream(downloadLocation);
            }

            return this.shelfRequest.downloadToStream(this.uri, downloadLocation).then(() => {
                // Intentionally left empty so we resolve with undefined.
            }, (err) => {
                promise = Promise.resolve();

                if (saveTo) {
                    promise = fsAsync.unlinkAsync(saveTo);
                }

                return promise.then(() => {
                    throw err;
                }, (unlinkErr) => {
                    logger.debug("Failed to cleanup file created for Shelf download.");
                    logger.debug(unlinkErr);

                    throw err;
                });
            });
        }
    }

    return Artifact;
};
