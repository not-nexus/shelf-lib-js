"use strict";

module.exports = (error, HttpLinkHeader, logger, ShelfError, URI) => {
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
     * Creates a ShelfError from an error which contains a
     * JSON response body with "code" and "message" properties.
     * These are actual Shelf errors instead of things that
     * could possibly come from a proxy or load balancer.
     *
     * @see {@link https://visionmedia.github.io/superagent/#error-handling}
     *
     * @param {superagent~Error} reason
     * @return {shelfLib~ShelfError}
     */
    function createErrorForShelf(reason) {
        var body, errorCode, errorKey;

        body = reason.response.body;

        errorKey = Object.keys(error).find((key) => {
            return error[key] === body.code;
        });

        if (errorKey) {
            errorCode = error[errorKey];
        } else {
            errorCode = error.UNKNOWN;
        }

        return new ShelfError(body.message, errorCode);
    }

    /**
     * Creates a ShelfError from any generic HTTP error.
     * This only requires that a status property exists.
     *
     * @see {@link https://visionmedia.github.io/superagent/#error-handling}
     *
     * @param {superagent~Error} reason
     * @return {shelfLib~ShelfError}
     */
    function createErrorForHttp(reason) {
        var errorCode, errorCodeMap, mappedCode, statusCode;

        errorCodeMap = {
            404: error.NOT_FOUND,
            500: error.INTERNAL_SERVER_ERROR
        };
        statusCode = reason.status;
        mappedCode = Object.keys(errorCodeMap).find((code) => {
            code = parseInt(code, 10);

            return code === statusCode;
        });
        errorCode = errorCodeMap[mappedCode] || error.UNKNOWN;

        return new ShelfError(`Got status code of "${statusCode}" with body "${reason.response.text}"`, errorCode);
    }

    /**
     * Creates a ShelfError from a TCP error. These are
     * things like connection reset and socket timeout.
     * This requires the "code" property to exist.
     *
     * @see {@link https://visionmedia.github.io/superagent/#error-handling}
     *
     * @param {superagent~Error} reason
     * @return {shelfLib~ShelfError}
     */
    function createErrorForTcp(reason) {
        var err;

        if (reason.code === error.TIMEOUT) {
            err = new ShelfError("A socket timeout occured", error.TIMEOUT);
        } else if (reason.code === error.COULD_NOT_RESOLVE_HOST) {
            err = new ShelfError("Could not resolve the host provided", error.COULD_NOT_RESOLVE_HOST);
        } else if (reason.code === error.CONNECTION_REFUSED) {
            err = new ShelfError("Unable to make a connection to the server. This is likely because the port we are trying to connect to is not listening", error.CONNECTION_REFUSED);
        } else {
            err = new ShelfError(reason.message, error.UNKNOWN);
        }

        return err;
    }


    /**
     * Maps error codes from the response to the internal error object.
     * Returns the corresponding error.
     *
     * @see {@link https://visionmedia.github.io/superagent/#error-handling}
     *
     * @param {superagent~Error} reason
     * @return {ShelfError}
     */
    function createErrorForResponse(reason) {
        var body, err;

        logger.debug("In responseHandler.handleErrorResponse()");

        if (!reason.status && reason.code) {
            err = createErrorForTcp(reason);
        } else if (reason.response) {
            body = reason.response.body || {};

            if (body.code && body.message) {
                err = createErrorForShelf(reason);
            } else {
                err = createErrorForHttp(reason);
            }
        } else {
            /* I have no idea what this error is supposed to be. The only thing I can depend on
             * is a message.
             */
            err = new ShelfError(reason.message, error.UNKNOWN);
        }

        return err;
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
