"use strict";

module.exports = (bluebird, error, ExtendedError, logger, parseLinkHeader, URI) => {
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
     * Returns the corresponding error.
     *
     * @param {http~IncomingMessage} errorResponse
     * @return {Error}
     */
    function createErrorForResponse(errorResponse) {
        var errorCode;

        logger.debug("In responseHandler.handleErrorResponse()");
        logger.debug(`Response param: ${JSON.stringify(errorResponse, null, 4)}`);

        // Since the structure of error responses can be different based on
        // where the error happens, we need to handle those different
        // structures. This is handling when request-promise gives us a
        // error reasonse.
        if (errorResponse.error) {
            errorResponse = errorResponse.response;
        }

        // If the response has a code property, then it is a timeout error.
        if (errorResponse.code) {
            return new ExtendedError("Socket Timeout", error.TIMEOUT);
        }

        errorCode = Object.keys(error).filter((key) => {
            return error[key] === errorResponse.body.code;
        });
        logger.debug(`Got error code: ${errorCode}`);

        if (errorCode.length > 0) {
            return new ExtendedError(errorResponse.body.message, errorCode);
        }

        return new ExtendedError(error.UNKNOWN, error.UNKNOWN);
    }


    /**
     * Facade function to nicely throw the corresponding error from a response.
     *
     * @param {http~IncomingMessage} errorResponse
     */
    function handleErrorResponse(errorResponse) {
        throw createErrorForResponse(errorResponse);
    }


    /**
     * Return the path part of the link but do a full resolve based
     * off of the URL we requested. Why do this? Links CAN be relative. So
     * if I put to "/hello/hi/whatup" and I get a link header back "../../sup/yo"
     * the link I want back is "/hello/sup/yo".
     *
     * This can be used for both link headers and location headers.
     *
     * @param {string} url
     * @param {string} link
     * @return {string}
     */
    function resolveLink(url, link) {
        var uri;

        logger.debug("In responseHandler.resolveLink()");
        logger.debug(`Url param: ${url}. Link param: ${link}`);

        uri = new URI(link, url);

        return uri.path().toString();
    }


    /**
     * Takes a response, gets link headers, parses them, creates a list
     * of strings, and returns that list of strings. If no link header was
     * found, this will return an empty array.
     *
     * @param {http~IncomingMessage} response
     * @return {string[]}
     */
    function resolveLinkHeaders(response) {
        var links, resolvedLinkHeaders, urls;

        logger.debug("In responseHandler.resolveLinkHeaders()");
        logger.debug(`Response param: ${JSON.stringify(response, null, 4)}`);

        urls = [];

        if (response.headers.link) {
            logger.debug(`Got link attribute: ${response.headers.link}`);
            links = parseLinkHeader(response.headers.link);
            logger.debug(`Parsed link header: ${JSON.stringify(links, null, 4)}`);

            // If we received more than one link header item, push them
            // all onto an array. If we received just one, push just that
            // one onto the array.
            if (!Array.isArray(links.item)) {
                urls = [links.item];
            }

            logger.debug(`Parsed out links: ${JSON.stringify(urls, null, 4)}`);
        }

        urls.forEach((url) => {
            // Grabs all characters after artifact in the url.
            url = url.substr(url.indexOf("artifact") + 8);
            resolvedLinkHeaders.push(resolveLink(response, url));
        });

        return resolvedLinkHeaders;
    }

    return {
        createErrorForResponse,
        handleErrorResponse,
        isErrorCode,
        resolveLink,
        resolveLinkHeaders
    };
};
