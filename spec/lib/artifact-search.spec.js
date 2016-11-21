"use strict";

describe("lib/artifact-search", () => {
    var ArtifactSearch, authToken, bluebird, error, host, instance, logger, path, refName, requestOptionsMock, requestPromiseMock, responseHandlerMock, URI;

    authToken = "abcd1234";
    bluebird = require("bluebird");
    error = require("../../lib/error")();
    host = "exampleHost";
    logger = require("../../lib/logger")();
    path = jasmine.createSpy;
    refName = "exampleRefName";
    requestOptionsMock = require("../mock/request-options-mock")();
    requestPromiseMock = require("../mock/request-promise-mock")();
    responseHandlerMock = require("../mock/response-handler-mock")();
    URI = require("urijs");
    ArtifactSearch = require("../../lib/artifact-search.js")(bluebird, error, logger, requestOptionsMock, requestPromiseMock, responseHandlerMock, URI);
    beforeEach(() => {
        instance = new ArtifactSearch(host, refName, path, authToken);
    });
    describe(".search()", () => {
        it("calls responseHandler.resolveLinkHeaders()", () => {
            responseHandlerMock.resolveLinkHeaders.andReturn([]);

            return instance.search().then(() => {
                expect(responseHandlerMock.resolveLinkHeaders).toHaveBeenCalled();
            });
        });
        it("returns an array of URLs", () => {
            responseHandlerMock.resolveLinkHeaders.andReturn([
                "http://www.example.com/refName/artifact/exampleData1",
                "http://www.example.com/refName/artifact/exampleData2"
            ]);
            responseHandlerMock.resolveLink.andCallFake((options, val) => {
                return val;
            });

            return instance.search().then((urls) => {
                expect(urls).toEqual(jasmine.any(Array));
            });
        });
        it("calls responseHandler.handleErrorResponse on error", () => {
            requestPromiseMock.post.andReturn(bluebird.reject());

            return instance.search().then(() => {
                expect(responseHandlerMock.handleErrorResponse).toHaveBeenCalled();
            });
        });
        describe(".validateSearchItem()", () => {
            var searchParameters;

            beforeEach(() => {
                spyOn(bluebird, "reject").andCallThrough();
                spyOn(bluebird, "resolve").andCallThrough();
                responseHandlerMock.resolveLinkHeaders.andReturn([]);
            });
            it("rejects if the query violates the regex", () => {
                searchParameters = {
                    search: "\\=Invalid Query"
                };

                return instance.search(searchParameters).then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
            it("resolves with a valid query", () => {
                searchParameters = {
                    search: "Valid=Query"
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
            var searchParameters;

            beforeEach(() => {
                responseHandlerMock.resolveLinkHeaders.andReturn([]);
            });
            it("resolves the promise if the query list is falsy", () => {
                spyOn(bluebird, "resolve").andCallThrough();

                return instance.search().then(() => {
                    expect(bluebird.resolve).toHaveBeenCalled();
                });
            });
            it("turns the query list into an array if it isn't already", () => {
                spyOn(bluebird, "map").andReturn(bluebird.resolve());
                searchParameters = {
                    search: "Single Query"
                };

                return instance.search(searchParameters).then(() => {
                    expect(bluebird.map).toHaveBeenCalled();
                });
            });
            it("maps the query list if it is an array", () => {
                spyOn(bluebird, "map").andReturn(bluebird.resolve());
                searchParameters = {
                    search: [
                        "firstQuery",
                        "secondQuery"
                    ]
                };

                return instance.search(searchParameters).then(() => {
                    expect(bluebird.map).toHaveBeenCalled();
                });
            });
        });
    });
});
