"use strict";

describe("lib/response-handler", () => {
    var bluebird, error, logger, parseLinkHeader, responseHandler, URI;

    bluebird = require("bluebird");
    error = require("../../lib/error")();
    logger = require("../../lib/logger")();
    parseLinkHeader = require("parse-link-header");
    URI = require("urijs");
    responseHandler = require("../../lib/response-handler")(bluebird, error, logger, parseLinkHeader, URI);

    describe(".isErrorCode()", () => {
        it("returns false if the status code is within the right range", () => {
            expect(responseHandler.isErrorCode(300)).toBe(false);
        });
        it("returns true if the status code is less than 200", () => {
            expect(responseHandler.isErrorCode(150)).toBe(true);
        });
        it("returns true if the status code is greater than 399", () => {
            expect(responseHandler.isErrorCode(404)).toBe(true);
        });
    });
    describe(".createErrorForResponse()", () => {
        var errorResponse;

        it("sets the resposne", () => {
            errorResponse = {
                error: "ExampleError",
                response: {
                    body: {
                        code: "duplicate_artifact",
                        message: "Example Error Message"
                    }
                }
            };
            expect(responseHandler.createErrorForResponse(errorResponse)).toEqual(new Error("Example Error Message"));
        });
        it("returns any unkown errors", () => {
            errorResponse = {
                body: {
                    code: "anUnkownError"
                }
            };
            expect(responseHandler.createErrorForResponse(errorResponse)).toEqual(new Error("UNKOWN", "UNKOWN"));
        });
        it("returns a timeout error", () => {
            errorResponse = {
                code: "exampleTimeoutError"
            };
            expect(responseHandler.createErrorForResponse(errorResponse)).toEqual(new Error("ESOCKETTIMEDOUT"));
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

            expect(responseHandler.createErrorForResponse(errorResponse)).toEqual(new Error("A duplicate artifact error message"));
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
        it("returns a new URI as a string", () => {
            var link, resolvedLink, url;

            link = "link/example";
            url = "url/example";
            resolvedLink = responseHandler.resolveLink(link, url);
            expect(resolvedLink).toBe("link/url/example");
        });
    });
    describe(".resolveLinkHeaders()", () => {
        it("returns an array of urls", () => {
            var response, urls;

            response = {
                headers: {
                    link: "<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel=\"item\", <https://api.github.com/user/9287/repos?page=1&per_page=100>; rel=\"item\"; pet='cat', <https://api.github.com/user/9287/repos?page=5&per_page=100>; rel=\"item\""
                }
            };
            urls = responseHandler.resolveLinkHeaders(response);
            expect(urls).toEqual([
                "https://api.github.com/user/9287/repos?page=3&per_page=100",
                "https://api.github.com/user/9287/repos?page=1&per_page=100",
                "https://api.github.com/user/9287/repos?page=5&per_page=100"
            ]);
        });
        it("returns an empty array if response.headers.link is falsy", () => {
            var response, urls;

            urls = responseHandler.resolveLinkHeaders(response);
            expect(Array.isArray(urls)).toBe(true);
            expect(urls.length).toBe(0);
        });
        it("returns an array with one url", () => {
            var response, urls;

            response = {
                headers: {
                    link: "<https://api.github.com/user/9287/repos?page=3&per_page=100>; rel=\"item\""
                }
            };
            urls = responseHandler.resolveLinkHeaders(response);
            expect(urls).toEqual([
                "https://api.github.com/user/9287/repos?page=3&per_page=100"
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
