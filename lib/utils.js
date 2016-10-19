"use strict";

module.exports = (dateService, logger, URI) => {
    /**
     * Concats the environment and role together to make the path.
     *
     * @param {Object} args The user entered arguments.
     * @return {string}
     */
    function buildPath(args) {
        var path;

        path = `${args.environment}/${args.role}`;

        logger.debug(`Built Shelf path: ${path}`);

        return path;
    }

    /**
     * Builds a full URL based on the path provided.  The path
     * doesn't (and should not) include the bucket name or the static
     * "artifact" section.
     *
     * https://api.shelf.cwscloud.net/<bucket>/artifact/<path>
     *
     * You only provide the path section.
     *
     * @param {string} path
     * @param {string} host
     * @param {string} refName
     * @return {string}
     */
    function buildUrl(path, host, refName) {
        var uri;

        if (path[0] === "/") {
            // Remove first slash if one was provided.
            path = path.slice(1);
        }

        if (path[path.length - 1] === "/") {
            path = path.slice(0, path.length);
        }

        // TODO: Check host to see if it starts with "http://"" or "https://"
        // TODO: Ask Kyle about why he had the dateService.now() after path
        uri = new URI(host)
                .path(`${refName}/artifact/${path}`)
                .toString();

        logger.debug(`Created new URI: ${uri}`);

        return uri;
    }

    /**
     * Parses and returns link headers.
     *
     * @param {string} linkHeader The raw link header.
     * @return {Object}
     */
    function parseLinkHeader(linkHeader) {
        var links;

        logger.debug(`Got Link attribute: ${linkHeader}`);

        links = linkHeader.split(",");

        links.forEach((val, index) => {
            var linkUrl, parts;

            parts = val.split(";");
            linkUrl = parts.shift().replace(/[<>]/g, "");

            links[index] = linkUrl;
        });

        logger.debug(`Parsed out links: ${links}`);

        return links;
    }

    /**
     * @typedef {Object} returnObj
     * @property {string} statusCode
     * @property {Object} body
     * @property {string[]} links
     */

    /**
     * Handles the response gotten from making requests to Shelf.
     *
     * @param {http~IncomingMessage} response
     * @return {Object}
     */
    function handleResponse(response) {
        var body, links, returnObj, statusCode;

        logger.debug("In utils.handleResponse()");
        logger.debug(`Response: ${JSON.stringify(response, null, 4)}`);
        logger.debug(`Status code: ${response.statusCode}`);
        logger.debug(`Response body: ${JSON.stringify(response.body, null, 4)}`);

        statusCode = response.statusCode;

        if (response.body) {
            body = response.body;
        } else {
            body = "";
        }

        if (response.headers.link) {
            links = parseLinkHeader(response.headers.link);
        }

        returnObj = {
            statusCode,
            body,
            links
        };

        return returnObj;
    }

    return {
        buildPath,
        buildUrl,
        handleResponse
    };
};
