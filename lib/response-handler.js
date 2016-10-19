"use strict";

module.exports = (curry, logger, URI) => {
    /**
     * Returns the full uri to the created resource or
     * will throw an Error with details about the failure.
     *
     * @param {string} serviceName
     * @param {string} url
     * @param {http~IncomingMessage} response
     * @return {string}
     * @throw Error
     */
    function handleCreate(serviceName, url, response) {
        var body, statusCode, uri;

        body = response.body;
        statusCode = response.statusCode;

        logger.debug(`(${serviceName}) Status Code: ${statusCode}`);
        logger.debug(`(${serviceName}) Response Body: ${body}`);
        if (statusCode > 299 || statusCode < 200) {
            throw new Error(`(${serviceName})Detected failure in response.  Status code: ${statusCode} Body: ${body}`);
        }

        // Used because the location header could be a relative path.
        uri = new URI(response.headers.location, url).toString();
        logger.debug(`Created new URI: ${uri}`);

        return uri;
    }

    /**
     * Exposes a set of functions that are curried.  This means you can provide
     * as many arguments as you want and it will continue to return another
     * curried function until all arguments are provided. A typical use case is
     * probably something like so.
     *
     *     serviceCreate = responseHandler.handleCreate("Opentoken");
     *
     *     ...
     *
     *     uri = "https://api.opentoken.io/blah/blah";
     *     blahBlahHandler = serviceCreate(uri);
     *     return request(uri).then(blahBlahHandler);
     */
    return {
        handleCreate: curry(handleCreate)
    };
};
