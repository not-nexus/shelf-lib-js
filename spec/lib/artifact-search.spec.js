"use strict";

describe("lib/artifact-search", () => {
    var ArtifactSearch, authToken, bluebird, error, host, instance, logger, parseLinkHeader, path, refName, requestOptions, requestPromiseMock, responseHandler, searchParameters, ShelfError, URI;

    authToken = "abcd1234";
    bluebird = require("bluebird");
    error = require("../../lib/error")();
    host = "exampleHost";
    logger = require("../../lib/logger")();
    parseLinkHeader = require("parse-link-header");
    path = "example/path";
    refName = "exampleRefName";
    requestOptions = require("../../lib/request-options")({}, logger);
    requestPromiseMock = require("../mock/request-promise-mock")();
    ShelfError = require("../../lib/shelf-error")();
    URI = require("urijs");
    responseHandler = require("../../lib/response-handler")(bluebird, error, logger, parseLinkHeader, ShelfError, URI);
    ArtifactSearch = require("../../lib/artifact-search.js")(bluebird, error, logger, requestOptions, requestPromiseMock, responseHandler, ShelfError, URI);
    beforeEach(() => {
        instance = new ArtifactSearch(host, refName, path, authToken);
        spyOn(responseHandler, "handleErrorResponse");
        spyOn(bluebird, "map").andCallThrough();
        spyOn(bluebird, "reject").andCallThrough();
        spyOn(bluebird, "resolve").andCallThrough();
    });
    describe(".search()", () => {
        it("returns an array of URLs", () => {
            searchParameters = {
                search: [
                    "example=123",
                    "example=456"
                ]
            };

            return instance.search(searchParameters).then((urls) => {
                expect(urls).toEqual([
                    "/shelf-js-test/an-artifact/2016-11-23T16:03:05.239Z",
                    "/shelf-js-test/an-artifact/2016-11-23T16:01:29.716Z"
                ]);
            });
        });
        it("catches errors from requestPromise", () => {
            requestPromiseMock.post.andReturn(bluebird.reject({
                code: "exampleTimeoutError"
            }));

            return instance.search().then(() => {
                expect(responseHandler.handleErrorResponse).toHaveBeenCalledWith({
                    code: "exampleTimeoutError"
                });
            });
        });
        describe(".validateSearchItem()", () => {
            it("rejects if a search value doesn't provide the section when using the search string form =", () => {
                /* eslint-disable no-useless-escape */
                searchParameters = {
                    search: "Invalid\\=Query"
                };

                /* eslint-enable no-useless-escape */

                return instance.search(searchParameters).then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
            it("resolves a valid query", () => {
                searchParameters = {
                    search: "Valid=Query"
                };

                return instance.search(searchParameters).then(() => {
                    expect(bluebird.resolve).toHaveBeenCalled();
                });
            });
            it("resolves a valid query with '=*'", () => {
                searchParameters = {
                    search: "Valid=*Query"
                };

                return instance.search(searchParameters).then(() => {
                    expect(bluebird.resolve).toHaveBeenCalled();
                });
            });
            it("resolves a valid query with ~=", () => {
                searchParameters = {
                    search: "Valid~=Query"
                };

                return instance.search(searchParameters).then(() => {
                    expect(bluebird.resolve).toHaveBeenCalled();
                });
            });
            it("rejects if the query isn't a string", () => {
                searchParameters = {
                    search: {
                        query: "This won't work"
                    }
                };

                return instance.search(searchParameters).then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
        });
        describe(".validateSearch()", () => {
            it("resolves the promise if the query list is falsy", () => {
                return instance.search().then(() => {
                    expect(bluebird.resolve).toHaveBeenCalled();
                });
            });
            it("processes a single query", () => {
                searchParameters = {
                    search: "Valid=Query"
                };

                return instance.search(searchParameters).then(() => {
                    expect(bluebird.map).toHaveBeenCalled();
                });
            });
            it("processes an array of queries", () => {
                searchParameters = {
                    search: [
                        "firstValid=Query",
                        "secondValid=Query"
                    ]
                };

                return instance.search(searchParameters).then(() => {
                    expect(bluebird.map).toHaveBeenCalled();
                });
            });
        });
    });
});
