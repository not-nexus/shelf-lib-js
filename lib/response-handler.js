"use strict";

module.exports = (bluebird, error, logger, parseLinkHeader) => {
    /**
     * Handles the response gotten from making requests to Shelf.
     *
     * @param {http~IncomingMessage} response
     * @return {Promise.<Object>|Error}
     */
    function handleArtifactResponse(response) {
        var artifactResponse;

        logger.debug("In handleArtifactResponse()");
        logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
        logger.debug(`Status code: ${response.statusCode}`);
        artifactResponse = {};

        if (response.statusCode === 201) {
            logger.info("Artifact upload successful.");
            artifactResponse = response.headers.location;
        } else if (response.statusCode === 200) {
            logger.info("Artifact download successful.");
            artifactResponse = response.body;
        } else {
            if (response.body.code) {
                // Try to grab the error code we received.
                artifactResponse = Object.keys(error).filter((key) => {
                    return key.code === response.body.code;
                });

                if (artifactResponse) {
                    return bluebird.reject(new Error(artifactResponse.message, artifactResponse.code));
                }

                return bluebird.reject(new Error(error.UNKNOWN.message, error.UNKNOWN.code));
            } else if (response.body === error.UNAUTHORIZED.message) {
                return bluebird.reject(new Error(error.UNAUTHORIZED.message, error.UNAUTHORIZED.code));
            }

            return bluebird.reject(new Error(error.UNKNOWN.message, error.UNKNOWN.code));
        }

        return bluebird.resolve(artifactResponse);
    }


    /**
     * Handles the response gotten from making requests to Shelf.
     *
     * @param {http~IncomingMessage} response
     * @return {Promise.<Object>|Error}
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

        if (response.statusCode === 204) {
            if (response.headers.link) {
                logger.debug(`Got Link attribute: ${response.headers.link}`);
                links = parseLinkHeader(response.headers.link);
                logger.debug(`Parsed link header: ${JSON.stringify(links, null, 4)}`);
                links.item.forEach((val) => {
                    urls.push(val.url);
                });
                logger.debug(`Parsed out links: ${urls}`);
                artifactSearchResponse = urls;
            }
        } else {
            return bluebird.reject(new Error(error.UNKNOWN.message, error.UNKNOWN.code));
        }

        return bluebird.resolve(artifactSearchResponse);
    }


    /**
     * Handles the response gotten from making requests to Shelf.
     *
     * @param {http~IncomingMessage} response
     * @return {Promise.<Object>|Error}
     */
    function handleMetadataResponse(response) {
        var metadataResponse;

        logger.debug("In handleResponse()");
        logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
        logger.debug(`Status code: ${response.statusCode}`);
        logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);
        metadataResponse = {};

        if (!response.body) {
            response.body = {};
        }

        if (response.statusCode === 200) {
            logger.info("Successfully got metadata.");
            metadataResponse = response.body;
        } else if (response.statusCode === 201) {
            logger.info("Metadata create or update successful.");
            metadataResponse = response.body;
        } else if (response.statusCode === 204) {
            logger.info("Successfully deleted metadata.");
        } else {
            if (response.body.code) {
                // Try to grab the error code we received.
                metadataResponse = Object.keys(error).filter((key) => {
                    return key.code === response.body.code;
                });

                if (metadataResponse) {
                    return bluebird.reject(new Error(metadataResponse.message, metadataResponse.code));
                }

                return bluebird.reject(new Error(error.UNKNOWN.message, error.UNKNOWN.code));
            } else if (response.body === error.UNAUTHORIZED.message) {
                return bluebird.reject(new Error(error.UNAUTHORIZED.message, error.UNAUTHORIZED.code));
            }

            return bluebird.reject(new Error(error.UNKNOWN.message, error.UNKNOWN.code));
        }

        return bluebird.resolve(metadataResponse);
    }

    return {
        handleArtifactResponse,
        handleArtifactSearchResponse,
        handleMetadataResponse
    };
};
