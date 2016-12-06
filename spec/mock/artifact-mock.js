"use strict";

module.exports = () => {
    /**
     * Mock class for Artifact
     */
    class ArtifactMock {
        /**
         * @param {string} uri
         * @param {string} authToken
         */
        constructor(uri, authToken) {
            this.uri = uri;
            this.authToken = authToken;
        }
    }

    return ArtifactMock;
};

