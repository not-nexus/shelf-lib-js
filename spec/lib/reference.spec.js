"use strict";

describe("lib/reference", () => {
    var artifact, Artifact, ArtifactSearch, authToken, bluebird, dateService, error, fs, hostMock, instance, logger, Metadata, path, Reference, refName, request, requestOptions, requestPromiseMock, responseHandler, ShelfError, URI;

    authToken = "abcd1234";
    dateService = require("../../lib/date-service")();
    hostMock = "exampleHost";
    logger = require("../../lib/logger")();
    path = "some/example/path";
    refName = "exampleRefName";
    requestPromiseMock = require("../mock/request-promise-mock")();
    URI = require("urijs");
    Metadata = require("../../lib/metadata")(bluebird, error, logger, requestOptions, requestPromiseMock, responseHandler, ShelfError);
    Artifact = require("../../lib/artifact")(bluebird, fs, logger, request, requestOptions, requestPromiseMock, responseHandler, Metadata);
    ArtifactSearch = require("../../lib/artifact-search")(bluebird, error, logger, requestOptions, responseHandler, ShelfError, URI);
    Reference = require("../../lib/reference")(Artifact, ArtifactSearch, dateService, logger, hostMock, requestPromiseMock, URI);

    beforeEach(() => {
        instance = new Reference(refName, authToken);
        spyOn(instance, "buildUrl").andCallThrough();
    });
    describe(".initArtifact()", () => {
        beforeEach(() => {
            artifact = instance.initArtifact(path);
        });
        it("calls .buildUrl()", () => {
            expect(instance.buildUrl).toHaveBeenCalledWith("some/example/path");
        });
        it("instantiates a new Artifact", () => {
            expect(artifact).toEqual(jasmine.any(Artifact));
        });
    });
    describe(".initArtifactWithTimestamp()", () => {
        beforeEach(() => {
            spyOn(dateService, "now").andReturn("2016-12-06T15:58:59.670Z");
            artifact = instance.initArtifactWithTimestamp(path);
        });
        it("calls .buildUrl()", () => {
            expect(instance.buildUrl).toHaveBeenCalledWith("some/example/path/2016-12-06T15:58:59.670Z");
        });
        it("call dateService.now()", () => {
            expect(dateService.now).toHaveBeenCalled();
        });
        it("instantiates a new Artifact", () => {
            expect(artifact).toEqual(jasmine.any(Artifact));
        });
    });
    describe(".initSearch()", () => {
        it("instantiates a new ArtifactSearch", () => {
            var artifactSearch;

            artifactSearch = instance.initSearch(path);
            expect(artifactSearch).toEqual(jasmine.any(ArtifactSearch));
        });
    });
    describe(".buildUrl()", () => {
        it("returns the URI as a string", () => {
            var uriString;

            uriString = instance.buildUrl("some/example/path");
            expect(uriString).toBe("exampleRefName/artifact/some/example/path");
        });
    });
});

