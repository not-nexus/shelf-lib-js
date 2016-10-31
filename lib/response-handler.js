"use strict";

module.exports = (error, logger, parseLinkHeader) => {
    /**
     * @typedef {Object} artifactResponse
     * @property {string} statusCode
     * @property {string} code
     * @property {string} message
     * @property {Object} body
     */

    /**
     * Handles the response gotten from making requests to Shelf.
     *
     * @param {http~IncomingMessage} response
     * @return {Promise.<Object>}
     */
    function handleArtifactResponse(response) {
        var artifactResponse;

        logger.debug("In handleArtifactResponse()");

        if (!response.body) {
            response.body = {};
        }

        artifactResponse = {};
        logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
        logger.debug(`Status code: ${response.statusCode}`);
        logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);
        artifactResponse.statusCode = response.statusCode;

        if (artifactResponse.statusCode === 201) {
            artifactResponse.message = "Artifact upload successful.";
        } else if (artifactResponse.statusCode === 200) {
            artifactResponse.message = "Artifact download successful.";
            artifactResponse.body = response.body;
        } else {
            if (response.body.code) {
                // Try to grab the error code we received.
                artifactResponse = Object.keys(error).filter((key) => {
                    return key.code === response.body.code;
                });

                if (artifactResponse) {
                    throw new Error(artifactResponse.message, artifactResponse.code);
                } else {
                    throw new Error(error.UNKNOWN.message, error.UNKNOWN.code);
                }
            } else if (response.body === error.UNAUTHORIZED.message) {
                throw new Error(error.UNAUTHORIZED.message, error.UNAUTHORIZED.code);
            }

            throw new Error(error.UNKNOWN.message, error.UNKNOWN.code);
        }

        return Promise.resolve(artifactResponse);
    }


    /**
     * @typedef {Object} artifactSearchResponse
     * @property {string} statusCode
     * @property {Object} body The body of the response.
     * @property {string[]} links An array of strings holding the links from
     *                            a link header.
     */

    /**
     * Handles the response gotten from making requests to Shelf.
     *
     * @param {http~IncomingMessage} response
     * @return {Promise.<Object>}
     */
    function handleArtifactSearchResponse(response) {
        var artifactSearchResponse, links, urls;

        logger.debug("In handleResponse()");
        artifactSearchResponse = {};
        logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
        logger.debug(`Status code: ${response.statusCode}`);
        logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);
        artifactSearchResponse.statusCode = response.statusCode;
        urls = [];

        if (!response.body) {
            response.body = {};
        }

        if (response.statusCode === 204) {
            if (response.headers.link) {
                logger.debug(`Got Link attribute: ${response.headers.link}`);
                links = parseLinkHeader(response.headers.link);
                logger.debug(`Parsed link header: ${JSON.stringify(links, null, 4)}`);
                links.item.forEach((val) => {
                    urls.push(val.url);
                });
                logger.debug(`Parsed out links: ${urls}`);
                artifactSearchResponse.links = urls;
            }
        } else {
            throw new Error(error.UNKNOWN.message, error.UNKNOWN.code);
        }

        return Promise.resolve(artifactSearchResponse);
    }


    /**
     * @typedef {Object} metadataResponse
     * @property {string} statusCode
     * @property {Object} body The body of the response.
     * @property {string[]} links An array of strings holding the links from
     *                            a link header.
     */

    /**
     * Handles the response gotten from making requests to Shelf.
     *
     * @param {http~IncomingMessage} response
     * @return {Promise.<Object>}
     */
    function handleMetadataResponse(response) {
        var metadataResponse;

        logger.debug("In handleResponse()");
        logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
        logger.debug(`Status code: ${response.statusCode}`);
        logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);
        metadataResponse = {};
        metadataResponse.statusCode = response.statusCode;

        if (!response.body) {
            response.body = {};
        }

        if (response.statusCode === 200) {
            metadataResponse.message = "Successfully got metadata.";
        } else if (response.statusCode === 201) {
            metadataResponse.message = "Metadata create or update successful.";
        } else if (response.statusCode === 204) {
            metadataResponse.message = "Successfully deleted metadata.";
        } else {
            if (response.body.code) {
                // Try to grab the error code we received.
                metadataResponse = Object.keys(error).filter((key) => {
                    return key.code === response.body.code;
                });

                if (metadataResponse) {
                    throw new Error(metadataResponse.message, metadataResponse.code);
                } else {
                    throw new Error(error.UNKNOWN.message, error.UNKNOWN.code);
                }
            } else if (response.body === error.UNAUTHORIZED.message) {
                throw new Error(error.UNAUTHORIZED.message, error.UNAUTHORIZED.code);
            }

            throw new Error(error.UNKNOWN.message, error.UNKNOWN.code);
        }

        return Promise.resolve(metadataResponse);
    }

    return {
        handleArtifactResponse,
        handleArtifactSearchResponse,
        handleMetadataResponse
    };
};
