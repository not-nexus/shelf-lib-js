"use strict";

describe("lib/response-handler", () => {
    var bluebird, error, HttpLinkHeader, logger, responseHandler, ShelfError, URI;

    bluebird = require("bluebird");
    error = require("../../lib/error")();
    logger = require("../../lib/logger")();
    HttpLinkHeader = require("http-link-header");
    ShelfError = require("../../lib/shelf-error")();
    URI = require("urijs");
    responseHandler = require("../../lib/response-handler")(bluebird, error, HttpLinkHeader, logger, ShelfError, URI);
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
        var errorFromResponse, errorResponse;

        it("returns any unknown errors", () => {
            errorResponse = {
                body: {
                    code: "anUnknownError"
                }
            };
            errorFromResponse = responseHandler.createErrorForResponse(errorResponse);
            expect(errorFromResponse.message).toBe(error.UNKNOWN);
            expect(errorFromResponse.code).toBe(error.UNKNOWN);
        });
        it("returns the message with an unknown error if it exists", () => {
            var body;

            body = {
                code: "anUnknownError",
                message: "Oh no!"
            };
            errorResponse = {
                error: 500,
                response: {
                    body
                }
            };
            errorFromResponse = responseHandler.createErrorForResponse(errorResponse);
            expect(errorFromResponse.message).toBe(body.message);
            expect(errorFromResponse.code).toBe(error.UNKNOWN);
        });
        it("returns a timeout error", () => {
            errorResponse = {
                code: "exampleTimeoutError"
            };
            errorFromResponse = responseHandler.createErrorForResponse(errorResponse);
            expect(errorFromResponse.message).toBe("Socket Timeout");
            expect(errorFromResponse.code).toBe(error.TIMEOUT);
        });
        it("recognizes invalid_request_data_format", () => {
            var body;

            body = {
                code: error.INVALID_REQUEST_DATA_FORMAT,
                message: "Invalid blah blah blah"
            };
            errorResponse = {
                error: 500,
                response: {
                    body
                }
            };
            errorFromResponse = responseHandler.createErrorForResponse(errorResponse);
            expect(errorFromResponse.message).toBe(body.message);
            expect(errorFromResponse.code).toBe(body.code);
        });
        it("returns known errors", () => {
            errorResponse = {
                error: "duplicate_artifact",
                response: {
                    body: {
                        code: "duplicate_artifact",
                        message: "A duplicate artifact error message"
                    }
                }
            };
            errorFromResponse = responseHandler.createErrorForResponse(errorResponse);
            expect(errorFromResponse.message).toBe("A duplicate artifact error message");
            expect(errorFromResponse.code).toBe(error.DUPLICATE_ARTIFACT);
        });
    });
    describe(".handleErrorResponse()", () => {
        it("throws errors from responseHandler.createErrorForResponse()", () => {
            spyOn(responseHandler, "createErrorForResponse").andReturn(new Error("SomeError"));
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
                    href: "https://my-shelf.example.com/morty/artifact/_search"
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
                    href: "https://my-shelf.example.com/morty/artifact/_search"
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
