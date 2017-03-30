"use strict";

module.exports = (Artifact, ArtifactSearch, concatUri, dateService, error, logger, host, ShelfError, ShelfRequest) => {
    /**
     * A reference to a Shelf bucket.
     */
    class Reference {
        /**
         * @param {string} refName
         * @param {string} authToken
         */
        constructor(refName, authToken) {
            if (!refName || !authToken) {
                throw new ShelfError("Must provide both refName and authToken to Reference", error.INCORRECT_PARAMETERS);
            }
            this.authToken = authToken;
            this.refName = refName;
            this.shelfRequest = new ShelfRequest(this.authToken);
        }


        /**
         * Creates and returns a new Artifact at the given path.
         * If you would like to get an artifact at
         * "/<storage>/artifact/<artifactPath>" you would only provide
         * the "<artifactPath>" portion.
         *
         * @param {string} path
         * @return {Artifact}
         */
        initArtifact(path) {
            var uri;

            logger.debug(`In ${this.constructor.name}.initArtifact()`);
            uri = this.buildUrl(path);

            return new Artifact(uri, this.shelfRequest);
        }


        /**
         * Creates and returns a new Artifact at the provided path
         * plus a timestamp.
         * In this way the user can specify the same path over and over
         * but not run into conflicts with the artifact name.
         * If you would like to get an artifact at
         * "/<storage>/artifact/<artifactPath><currentTimestamp>" you would
         * only provide the "<artifactPath>" portion.
         *
         * For example:
         *     var artifact = reference.initArtifactWithTimestamp("pathy");
         *     console.log(artifact.uri); // Logs something like:
         *     "https://localhost:8080/refName/artifact/pathy/2016-11-01T14:37:04.151Z"
         *
         * @param {string} path The path to init the artifact at.
         *                      Should not end or begin with a "/".
         * @return {Artifact}
         */
        initArtifactWithTimestamp(path) {
            var uri;

            logger.debug(`In ${this.constructor.name}.initArtifactWithTimestamp()`);
            uri = this.buildUrl(`${path}/${dateService.now()}`);

            return new Artifact(uri, this.shelfRequest);
        }


        /**
         * Creates a search object at the given path.
         *
         * @param {string} [path] Creates a search that will be used for
         *                        performing searches for artifacts under
         *                        this path.
         * @return {ArtifactSearch}
         */
        initSearch(path) {
            var uri;

            if (!path) {
                path = "";
            }

            logger.debug(`In ${this.constructor.name}.initSearch()`);
            uri = this.buildUrl(path);

            return new ArtifactSearch(uri, this.shelfRequest);
        }


        /**
         * Builds a full URL based on the path provided. The path
         * doesn't (and should not) include the storage name or the static
         * "artifact" section.
         *
         * @param {string} additionalPath
         * @return {string}
         */
        buildUrl(additionalPath) {
            var uri;

            logger.debug("In buildUrl()");
            additionalPath = additionalPath.trim();
            uri = concatUri(host, this.refName, "artifact", additionalPath);

            return uri;
        }
    }

    return Reference;
};
