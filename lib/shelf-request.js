"use strict";

module.exports = (libOptions, logger, responseHandler, superagent, URI) => {
    /**
     * Encapsulates a few common operations that we do per request.
     */
    class ShelfRequest {
        /**
         * @param {string} authToken
         */
        constructor(authToken) {
            this.authToken = authToken;
        }


        /**
         * Attaches generic promise resolve and reject handlers.
         *
         * @param {Promise.<superagent~Request>} req
         * @return {Promise.<superagent~Response>}
         */
        attachGenericHandlers(req) {
            return req.then((response) => {
                this.logResponse(response, req.url);

                return response;
            }, (reason) => {
                responseHandler.handleErrorResponse(reason);
            });
        }


        /**
         * Attaches some common things to the request that will be
         * the same across the board.
         *
         * @param {superagent~Request} req
         * @return {superagent~Request}
         */
        attachCommon(req) {
            return req
                .timeout(libOptions.timeoutDuration)
                .retry(libOptions.retries)
                .set("Authorization", this.authToken);
        }


        /**
         * Runs all steps that are common for requests.
         *
         * @param {superagent~Request} req
         * @return {Promise.<superagent~Response>}
         */
        end(req) {
            this.attachCommon(req);
            this.logRequest(req);

            return this.attachGenericHandlers(req);
        }

        /**
         * Downloads the content of a resource and sticks
         * the result into a stream.
         *
         * @param {string} uri
         * @param {stream.Writable} stream
         * @return {Promise.<undefined>}
         */
        downloadToStream(uri, stream) {
            var promise, req, res;

            req = superagent
                .get(uri);
            this.attachCommon(req);
            this.logRequest(req);

            promise = new Promise((resolve, reject) => {
                var error, pipe;

                req.on("response", (response) => {
                    res = response;
                    if (!res.statusCode || responseHandler.isErrorCode(res.statusCode)) {
                        // To stop piping.
                        req.abort();

                        // Faking a superagent~Error.
                        error = new Error();
                        error.response = res;
                        error.status = res.statusCode;
                        reject(error);
                    }
                });
                req.on("error", (err) => {
                    reject(err);
                });
                pipe = req.pipe(stream);
                pipe.on("error", (err) => {
                    reject(err);
                });
                pipe.on("finish", () => {
                    // Finish will not be called if the pipe errors.
                    resolve(res);
                });
            });

            return promise.then((response) => {
                this.logResponse(response, req.url);

                return response;
            }, (reason) => {
                responseHandler.handleErrorResponse(reason);
            });
        }


        /**
         * Attempts to delete the resource represented
         * by the uri provided.
         *
         * @param {string} uri
         * @return {Promise.<superagent~Response>}
         */
        delete(uri) {
            var req;

            req = superagent.delete(uri);

            return this.end(req);
        }


        /**
         * Performs a get of a resource.
         *
         * Note: It is up to the consumer to know
         * how to interpret the response. You may
         * get an object back for JSON and you may
         * get a Buffer if it is an octet stream.
         *
         * @param {string} uri
         * @return {Promise.<superagent~Response>}
         */
        get(uri) {
            var req;

            /*
             * .buffer(true) is important so that the
             * response.body will be a Buffer ready for
             * the user to consume.
             */
            req = superagent.get(uri)
                .buffer(true);

            return this.end(req);
        }


        /**
         * POSTs the data provided to the uri provided.
         *
         * @param {string} uri
         * @param {Object} data
         * @return {Promise.<superagent~Response>}
         */
        post(uri, data) {
            var req;

            req = superagent.post(uri)
                .send(data);

            return this.end(req);
        }


        /**
         * PUTs the data provided to the uri provided.
         *
         * @param {string} uri
         * @param {Object} data
         * @return {Promise.<superagent~Response>}
         */
        put(uri, data) {
            var req;

            req = superagent.put(uri)
                .send(data);

            return this.end(req);
        }


        /**
         * Uploads a file to a resource.
         *
         * @param {string} uri
         * @param {(Buffer|stream.Readable)} buffer
         * @return {Promise.<superagent~Response>}
         */
        upload(uri, buffer) {
            var req;

            req = superagent
                .post(uri)
                .attach("file", buffer, {
                    filename: "file"
                });

            return this.end(req);
        }

        /**
         * Logs the request. It attempts to stay close to
         * what a real HTTP request would look like.
         *
         * @param {superagent~Request} req
         */
        logRequest(req) {
            var reqString, uri, uriString;

            uri = new URI(req.url);
            uriString = uri.path();
            reqString = "";
            reqString += `${req.method} ${uriString}\n`;
            reqString += this.stringifyHeaders(req);

            /* eslint no-underscore-dangle: ["error", { "allow": ["_data"] }] */
            if (req._data) {
                reqString += `\n${JSON.stringify(req._data)}`;
            }

            logger.info(reqString);
        }

        /**
         * Logs the response. Tries to keep as close to the format of a normal
         * HTTP response. For example, the protocol will be missing.
         *
         * @param {superagent~Response} res
         * @param {string} uri
         */
        logResponse(res, uri) {
            var resString, uriString;

            uri = new URI(uri);
            uriString = uri.path();
            resString = `RESPONSE FOR: ${uriString}\n`;

            // res.res is an IncommingMessage
            resString += `${res.statusCode} ${res.res.statusMessage}\n`;
            resString += this.stringifyHeaders(res);

            if (res.body && Object.keys(res.body).length) {
                resString += `\n\n${JSON.stringify(res.body)}`;
            }

            logger.info(resString);
        }

        /**
         * Creates a string that contains headers.
         *
         * @param {(superagent~Request|superagent~Response)} re
         * @return {string}
         */
        stringifyHeaders(re) {
            var str;

            str = "";
            Object.keys(re.header).forEach((key) => {
                var val;

                val = re.header[key];
                str += `${key}: ${val}\n`;
            });

            return str;
        }
    }

    return ShelfRequest;
};
