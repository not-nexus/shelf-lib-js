"use strict";

module.exports = () => {
    /**
     * A mock Metadata class.
     */
    class MetadataMock {
        /**
         * @param {string} authToken
         * @param {string} uri
         */
        constructor(authToken, uri) {
            this.authToken = authToken;
            this.uri = uri;
        }
    }

    return MetadataMock;
};

