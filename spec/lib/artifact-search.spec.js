"use strict";

describe("lib/artifact-search", () => {
    var ArtifactSearch, authToken, bluebird, host, instance, loggerMock, path, refName, requestOptionsMock, requestPromiseMock, responseHandlerMock, URI;

    authToken = "abcd1234";
    bluebird = require("bluebird");
    host = "exampleHost";
    loggerMock = require("../mock/logger-mock")();
    path = jasmine.createSpy;
    refName = "exampleRefName";
    requestOptionsMock = require("../mock/request-options-mock")();
    requestPromiseMock = require("../mock/request-promise-mock")();
    responseHandlerMock = require("../mock/response-handler-mock")();
    URI = require("urijs");
    ArtifactSearch = require("../../lib/artifact-search.js")(loggerMock, requestOptionsMock, requestPromiseMock, responseHandlerMock, URI);
    beforeEach(() => {
        instance = new ArtifactSearch(host, refName, path, authToken);
    });
    describe(".search()", () => {
        describe(".validateSearch", () => {
            var search, sort;

            beforeEach(() => {
                sort = "exampleSort";
                spyOn(bluebird, "resolve").andCallThrough();
                spyOn(bluebird, "reject").andCallThrough();
            });
            it("rejects when given input other than an array or array of strings", () => {
                search = {
                    search: "someSearch"
                };

                return instance.search(search, sort).then(jasmine.fail, (err) => {
                    expect(err).toBe("Search query must be a string or an array of strings");
                });
            });
            it("rejects when passed a string that contains \\=", () => {
                search = "some\\=InvalidSearch";

                return instance.search(search, sort).then(jasmine.fail, (err) => {
                    expect(err).toBe("Search query can't contain \"\\=\"");
                });
            });
            it("resolves when passed a valid string", () => {
                search = "someValidSearch";

                return instance.search(search, sort).then(() => {
                    expect(bluebird.resolve).toHaveBeenCalled();
                });
            });
            it("rejects when passed an array that doesn't only contain strings", () => {
                search = [
                    "firstSearch",
                    {
                        search: "secondSearch"
                    }
                ];

                return instance.search(search, sort).then(jasmine.fail, (err) => {
                    expect(err).toBe("Search query must be a string or an array of strings");
                });
            });
            it("rejects when passed an array that contains a string that includes \\= in it", () => {
                search = [
                    "someValidSearch",
                    "some\\=InvalidSearch"
                ];

                return instance.search(search, sort).then(jasmine.fail, (err) => {
                    expect(err).toBe("Search query can't contain \"\\=\"");
                });
            });
            it("resolves a valid array of strings", () => {
                search = [
                    "firstValidSearch",
                    "secondValidSearch"
                ];

                return instance.search(search, sort).then(() => {
                    expect(bluebird.resolve.callCount).toBe(2);
                    expect(bluebird.reject).not.toHaveBeenCalled();
                });
            });
        });
        // it("calls .validateSearch", () => {
        // });
    });
});
