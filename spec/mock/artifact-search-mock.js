"use strict";

module.exports = () => {
    /**
     * Mock class for ArtifactSearch
     */
    class ArtifactSearchMock {
        /**
         * @param {string} host
         * @param {string} refName
         * @param {string} path
         * @param {string} authToken
         */
        constructor(host, refName, path, authToken) {
            this.host = host;
            this.refName = refName;
            this.path = path;
            this.authToken = authToken;
        }
    }

    return ArtifactSearchMock;
};

