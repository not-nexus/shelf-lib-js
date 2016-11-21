"use strict";

describe("lib/reference", () => {
    var ArtifactMock, ArtifactSearchMock, authToken, dateService, hostMock, instance, logger, path, Reference, refName, requestPromiseMock, URI;

    ArtifactMock = require("../mock/artifact-mock")();
    ArtifactSearchMock = require("../mock/artifact-search-mock")();
    authToken = "abcd1234";
    dateService = require("../../lib/date-service")();
    hostMock = "exampleHost";
    logger = require("../../lib/logger")();
    path = "some/example/path";
    refName = "exampleRefName";
    requestPromiseMock = require("../mock/request-promise-mock")();
    URI = require("urijs");
    Reference = require("../../lib/reference")(ArtifactMock, ArtifactSearchMock, dateService, logger, hostMock, requestPromiseMock, URI);

    beforeEach(() => {
        instance = new Reference(refName, authToken);
    });
    describe(".initArtifact()", () => {
        beforeEach(() => {
            spyOn(instance, "buildUrl").andReturn("an/example/path");
        });
        it("calls .buildUrl()", () => {
            instance.initArtifact(path);
            expect(instance.buildUrl).toHaveBeenCalled();
        });
        it("instantiates a new Artifact", () => {
            var artifact;

            expect(artifact).toBeUndefined();
            artifact = instance.initArtifact(path);
            expect(artifact instanceof ArtifactMock).toBe(true);
        });
    });
    describe(".initArtifactWithTimestamp()", () => {
        beforeEach(() => {
            spyOn(instance, "buildUrl").andReturn("an/example/path");
        });
        it("calls .buildUrl()", () => {
            instance.initArtifact(path);
            expect(instance.buildUrl).toHaveBeenCalled();
        });
        it("call dateService.now()", () => {
            spyOn(dateService, "now").andCallThrough();
            instance.initArtifactWithTimestamp(path);
            expect(dateService.now).toHaveBeenCalled();
        });
        it("instantiates a new Artifact", () => {
            var artifact;

            expect(artifact).toBeUndefined();
            artifact = instance.initArtifact(path);
            expect(artifact instanceof ArtifactMock).toBe(true);
        });
    });
    describe(".createSearch()", () => {
        it("instantiates a new ArtifactSearch", () => {
            var artifactSearch;

            expect(artifactSearch).toBeUndefined();
            artifactSearch = instance.createSearch(path);
            expect(artifactSearch instanceof ArtifactSearchMock).toBe(true);
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

