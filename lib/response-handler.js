"use strict";

module.exports = (logger, parseLinkHeader) => {
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
            artifactResponse.code = response.body.code;
            artifactResponse.message = response.body.message;

            return Promise.reject(JSON.stringify(artifactResponse, null, 4));
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
            return Promise.reject("Shelf returned bad status code.");
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
        metadataResponse = {};
        logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
        logger.debug(`Status code: ${response.statusCode}`);
        logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);
        metadataResponse.statusCode = response.statusCode;

        if (!response.body) {
            response.body = {};
        }

        if (metadataResponse.statusCode === 201) {
            metadataResponse.message = "Metadata created or update successful.";
        } else if (metadataResponse.statusCode === 200) {
            metadataResponse.message = "Sucessfully got metadata.";
            metadataResponse.body = response.body;
        } else if (metadataResponse.statusCode === 204) {
            metadataResponse.message = "Sucessfully deleted metadata.";
        } else if (metadataResponse.statusCode === 403) {
            metadataResponse.message = response.body.message;
            metadataResponse.code = response.body.code;

            return Promise.reject(JSON.stringify(metadataResponse));
        } else if (metadataResponse.statusCode === 404) {
            metadataResponse.message = response.body.message;
            metadataResponse.code = response.body.code;

            return Promise.reject(JSON.stringify(metadataResponse));
        } else if (metadataResponse.statusCode === 401) {
            metadataResponse.message = "Permission denied.";

            return Promise.reject(JSON.stringify(metadataResponse));
        } else {
            metadataResponse.message = "Unknown error.";

            return Promise.reject(JSON.stringify(metadataResponse));
        }

        return Promise.resolve(metadataResponse);
    }

    return {
        handleArtifactResponse,
        handleArtifactSearchResponse,
        handleMetadataResponse
    };
};
