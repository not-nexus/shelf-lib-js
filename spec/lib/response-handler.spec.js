"use strict";

describe("lib/response-handler", () => {
    var error, lib, responseHandler;

    lib = jasmine.createTestLib();
    error = lib.error;
    responseHandler = lib.container.resolve("responseHandler");
    describe(".isErrorCode()", () => {
        it("returns false if the status code is within the right range", () => {
            expect(responseHandler.isErrorCode(300)).toBe(false);
        });
        it("returns false if the status code is 200", () => {
            expect(responseHandler.isErrorCode(200)).toBe(false);
        });
        it("returns false if the status code is 201", () => {
            expect(responseHandler.isErrorCode(201)).toBe(false);
        });
        it("returns true if the status code is less than 200", () => {
            expect(responseHandler.isErrorCode(150)).toBe(true);
        });
        it("returns true if the status code is greater than 399", () => {
            expect(responseHandler.isErrorCode(404)).toBe(true);
        });
    });
    describe(".createErrorForResponse()", () => {
        var createdErr, err;

        it("returns any unknown errors", () => {
            err = new Error("Oh no!");
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe(err.message);
            expect(createdErr.code).toBe(error.UNKNOWN);
        });
        it("handles an unknown shelf error.", () => {
            var body;

            body = {
                code: "anUnknownError",
                message: "Oh no!"
            };
            err = new Error("Some Error");
            err.status = 504;
            err.response = {
                body
            };
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe("Oh no!");
            expect(createdErr.code).toBe(error.UNKNOWN);
        });
        it("handles generic 404", () => {
            err = new Error("Not found");
            err.response = {
                text: "<h1>Not Found</h1>"
            };
            err.status = 404;
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe("Got status code of \"404\" with body \"<h1>Not Found</h1>\"");
            expect(createdErr.code).toBe(error.NOT_FOUND);
        });
        it("handles generic 500", () => {
            err = new Error("Not found");
            err.response = {
                text: "<h1>Internal Server Error</h1>"
            };
            err.status = 500;
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe("Got status code of \"500\" with body \"<h1>Internal Server Error</h1>\"");
            expect(createdErr.code).toBe(error.INTERNAL_SERVER_ERROR);
        });
        it("handles generic unknown error", () => {
            err = new Error("Not found");
            err.response = {
                text: "<h1>Gateway Timeout</h1>"
            };
            err.status = 504;
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe("Got status code of \"504\" with body \"<h1>Gateway Timeout</h1>\"");
            expect(createdErr.code).toBe(error.UNKNOWN);
        });
        it("returns a timeout error", () => {
            err = new Error("Timeout of 1000ms exceeded");
            err.code = "ECONNABORTED";
            err.errno = "ETIME";
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe("A socket timeout occured");
            expect(createdErr.code).toBe(error.TIMEOUT);
        });
        it("handles connection refused", () => {
            err = new Error("Error: connect ECONNREFUSED 127.0.0.1:8888");
            err.code = "ECONNREFUSED";
            err.errno = "ECONNREFUSED";
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe("Unable to make a connection to the server. This is likely because the port we are trying to connect to is not listening");
            expect(createdErr.code).toBe(error.CONNECTION_REFUSED);
        });
        it("Handles unable to resolve hostname", () => {
            err = new Error("getaddrinfo ENOTFOUND some-shelf-domain.com some-shelf-domain.com:80");
            err.code = "ENOTFOUND";
            err.errno = "ENOTFOUND";
            err.host = "some-shelf-domain.com";
            err.port = "80";
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe("Could not resolve the host provided");
            expect(createdErr.code).toBe(error.COULD_NOT_RESOLVE_HOST);
        });
        it("recognizes invalid_request_data_format", () => {
            var body;

            body = {
                code: error.INVALID_REQUEST_DATA_FORMAT,
                message: "Invalid blah blah blah"
            };
            err = new Error("Error message");
            err.status = 400;
            err.response = {
                body
            };
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe(body.message);
            expect(createdErr.code).toBe(body.code);
        });
        it("returns known errors", () => {
            var body;

            body = {
                code: "duplicate_artifact",
                message: "A duplicate artifact error message"
            };
            err = new Error("401 whatever");
            err.status = 401;
            err.response = {
                body
            };
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe(body.message);
            expect(createdErr.code).toBe(body.code);
        });
        it("handles unknown tcp errors", () => {
            err = new Error("Error: Connection Reset");
            err.code = "ECONNRESET";
            createdErr = responseHandler.createErrorForResponse(err);
            expect(createdErr.message).toBe(err.message);
            expect(createdErr.code).toBe(error.UNKNOWN);
        });
    });
    describe(".handleErrorResponse()", () => {
        it("throws errors from responseHandler.createErrorForResponse()", () => {
            spyOn(responseHandler, "createErrorForResponse").and.returnValue(new Error("SomeError"));
            expect(() => {
                responseHandler.handleErrorResponse();
            }).toThrow();
        });
    });
    describe(".resolveLink()", () => {
        it("returns a path", () => {
            var link, resolvedLink, resourceUrl;

            link = "https://my-shelf.example.com/morty/artifict/_search";
            resourceUrl = "morty/artifact/example/path";
            resolvedLink = responseHandler.resolveLink(link, resourceUrl);
            expect(resolvedLink).toBe("/example/path");
        });
        it("doesn't trim a string that doesn't include 'artifact'", () => {
            var link, resolvedLink, resourceUrl;

            link = "/morty/example/_search";
            resourceUrl = "/example/path";
            resolvedLink = responseHandler.resolveLink(link, resourceUrl);
            expect(resolvedLink).toBe("/example/path");
        });
    });
    describe(".resolveLinkHeaders()", () => {
        it("returns an array of urls", () => {
            var response, urls;

            response = {
                headers: {
                    link: "</morty/artifact/shelf-js-test/an-artifact/2016-11-23T16:03:05.239Z>; rel=\"item\"; title=\"artifact\", </morty/artifact/shelf-js-test/an-artifact/2016-11-23T16:01:29.716Z>; rel=\"item\"; title=\"artifact\", </morty/artifact/shelf-js-test/an-artifact/2016-11-30T15:00:38.132Z>; rel=\"item\"; title=\"artifact\""
                },
                request: {
                    url: "https://my-shelf.example.com/morty/artifact/_search"
                }
            };
            urls = responseHandler.resolveLinkHeaders(response);
            expect(urls).toEqual([
                "/shelf-js-test/an-artifact/2016-11-23T16:03:05.239Z",
                "/shelf-js-test/an-artifact/2016-11-23T16:01:29.716Z",
                "/shelf-js-test/an-artifact/2016-11-30T15:00:38.132Z"
            ]);
        });
        it("returns an empty array if response.headers.link is falsy", () => {
            var response, urls;

            urls = responseHandler.resolveLinkHeaders(response);
            expect(urls).toEqual(jasmine.any(Array));
            expect(urls.length).toBe(0);
        });
        it("returns an array with one url", () => {
            var response, urls;

            response = {
                headers: {
                    link: "</morty/artifact/shelf-js-test/an-artifact/2016-11-23T16:03:05.239Z>; rel=\"item\"; title=\"artifact\""
                },
                request: {
                    url: "https://my-shelf.example.com/morty/artifact/_search"
                }
            };
            urls = responseHandler.resolveLinkHeaders(response);
            expect(urls).toEqual([
                "/shelf-js-test/an-artifact/2016-11-23T16:03:05.239Z"
            ]);
        });
        it("returns an empty array if response.headers.link is falsy", () => {
            var response, urls;

            urls = responseHandler.resolveLinkHeaders(response);
            expect(Array.isArray(urls)).toBe(true);
            expect(urls.length).toBe(0);
        });
    });
});
