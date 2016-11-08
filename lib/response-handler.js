"use strict";

module.exports = (bluebird, error, logger, parseLinkHeader, URI) => {
    /**
     * Returns true if the status code is less than 200 or if it is
     * greater than 399. Returns false otherwise.
     *
     * @param {number} statusCode
     * @return {Boolean}
     */
    function isErrorCode(statusCode) {
        if (statusCode < 200 || statusCode > 399) {
            return true;
        }

        return false;
    }


    /**
     * Maps error codes from the response to the internal error object.
     * Throws the corresponding error.
     *
     * @param {http~IncomingMessage} response
     * @return {Promise.<Object>|Error}
     */
    function handleErrorResponse(response) {
        var errorCode;

        logger.debug("In responseHandler.handleErrorResponse()");

        // If we have an error response from request-promise,
        // set the response to the actual response.
        if (response.error) {
            response = response.response;
        }

        if (isErrorCode(response.statusCode)) {
            errorCode = Object.keys(error).filter((key) => {
                return error[key] === response.body.code;
            });
            logger.debug(`Got error code: ${errorCode}`);

            if (errorCode) {
                return bluebird.reject(new Error(response.body.message, errorCode));
            }

            return bluebird.reject(new Error(error.UNKNOWN, error.UNKNOWN));
        }

        return bluebird.reject(new Error("Got unexpected status code."));
    }


    /**
     * Return the path part of the link but do a full resolve based
     * off of the URL we requested. Why do this? Links CAN be relative. So
     * if I put to "/hello/hi/whatup" and I get a link header back "../../sup/yo"
     * the link I want back is "/hello/sup/yo".
     *
     * This can be used for both link headers and location headers
     *
     * @param {string} url
     * @param {string} link
     * @return {string}
     */
    function resolveLink(url, link) {
        var uri;

        uri = new URI(link, url);

        return uri.toString();
    }


    /**
     * Takes a response, gets link headers, parses them, creates a list
     * of strings, returns that list of strings.
     *
     * @param {http~IncomingMessage} response
     * @return {string[]}
     */
    function resolveLinkHeaders(response) {
        var links, urls;

        urls = [];

        if (response.headers.link) {
            logger.debug(`Got Link attribute: ${response.headers.link}`);
            links = parseLinkHeader(response.headers.link);
            logger.debug(`Parsed link header: ${JSON.stringify(links, null, 4)}`);
            links.item.forEach((val) => {
                urls.push(val.url);
            });
            logger.debug(`Parsed out links: ${urls}`);
        }

        return urls;
    }

    return {
        handleErrorResponse,
        isErrorCode,
        resolveLink,
        resolveLinkHeaders
    };
};
