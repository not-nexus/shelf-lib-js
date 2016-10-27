"use strict";

module.exports = (Artifact, ArtifactSearch, logger, host, requestPromise, URI) => {
    /**
     * A reference to a Shelf bucket.
     */
    class Reference {
        /**
         * @param {string} refName
         * @param {string} authToken
         */
        constructor(refName, authToken) {
            this.authToken = authToken;
            this.refName = refName;
        }


        /**
         * Creates and returns a new Artifact at the given path.
         *
         * @param {string} path
         * @return {Artifact}
         */
        initArtifact(path) {
            var uri;

            logger.debug(`In ${this.constructor.name}.initArtifact()`);
            uri = this.buildUrl(path);

            return new Artifact(uri, this.authToken);
        }


        /**
         * Creates a search object at the given path.
         *
         * @param {string} path
         * @return {ArtifactSearch}
         */
        createSearch(path) {
            logger.debug(`In ${this.constructor.name}.createSearch()`);

            return new ArtifactSearch(host, this.refName, path, this.authToken);
        }


        /**
         * Builds a full URL based on the path provided.  The path
         * doesn't (and should not) include the bucket name or the static
         * "artifact" section.
         *
         * @param {string} path
         * @return {string}
         */
        buildUrl(path) {
            var pathParts, uri;

            logger.debug("In buildUrl()");
            path = path.trim();

            uri = new URI(path);
            pathParts = uri.segment();

            if (pathParts[0] !== this.refName && pathParts[1] !== "artifact") {
                pathParts.unshift("artifact");
                pathParts.unshift(this.refName);
            }

            uri = new URI(host)
                    .segment(pathParts)
                    .toString();
            logger.debug(`Created new URI: ${uri}`);

            return uri;
        }
    }

    return Reference;
};
