"use strict";

module.exports = (bluebird, error, HttpLinkHeader, logger, ShelfError, URI) => {
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
     * @param {(http~IncomingMessage|requestPromise~RequestError)} errorResponse
     * @return {ShelfError}
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
            return new ShelfError("Socket Timeout", error.TIMEOUT);
        }

        errorCode = Object.keys(error).find((key) => {
            return error[key] === errorResponse.body.code;
        });
        logger.debug(`Got error code: ${errorCode}`);

        if (errorCode) {
            return new ShelfError(errorResponse.body.message, error[errorCode]);
        }

        return new ShelfError(error.UNKNOWN, error.UNKNOWN);
    }


    /**
     * Facade function to nicely throw the corresponding error from a response.
     *
     * @param {(http~IncomingMessage|requestPromise~RequestError)} errorResponse
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
     * @param {string} resourceUrl
     * @param {string} link
     * @return {string}
     */
    function resolveLink(resourceUrl, link) {
        var resolvedLink, uri;

        logger.debug("In responseHandler.resolveLink()");
        logger.debug(`Url param: ${resourceUrl}. Link param: ${link}`);

        uri = new URI(link, resourceUrl);
        resolvedLink = uri.path().toString();

        if (resolvedLink.includes("artifact")) {
            // Grabs all characters after "artifact" in the url.
            resolvedLink = resolvedLink.substr(resolvedLink.indexOf("artifact") + 8);
        }

        return resolvedLink;
    }


    /**
     * Takes a response, gets link headers, parses them, creates a list
     * of strings, and returns that list of strings. If no link header was
     * found, this will return an empty array.
     *
     * @param {(http~IncomingMessage|requestPromise~RequestError)} response
     * @return {string[]}
     */
    function resolveLinkHeaders(response) {
        var links, resolvedLinkHeaders;

        logger.debug("In responseHandler.resolveLinkHeaders()");
        logger.debug(`Response param: ${JSON.stringify(response, null, 4)}`);

        links = [];
        resolvedLinkHeaders = [];

        if (response && response.headers && response.headers.link) {
            logger.debug(`Got link attribute: ${response.headers.link}`);
            links = HttpLinkHeader.parse(response.headers.link);
            links = links.rel("item");
            logger.debug(`Parsed link header: ${JSON.stringify(links, null, 4)}`);
        }

        links.forEach((item) => {
            var resolvedLink;

            resolvedLink = resolveLink(response.request.href, item.uri);
            resolvedLinkHeaders.push(resolvedLink);
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
