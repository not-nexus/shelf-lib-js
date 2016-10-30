"use strict";

describe("lib/reference", () => {
    var ArtifactMock, ArtifactSearchMock, authToken, hostMock, instance, loggerMock, path, Reference, refName, requestPromiseMock, uri;

    ArtifactMock = require("../mock/artifact-mock")();
    ArtifactSearchMock = require("../mock/artifact-search-mock")();
    authToken = "abcd1234";
    hostMock = "exampleHost";
    loggerMock = require("../mock/logger-mock")();
    path = "some/example/path";
    refName = "exampleRefName";
    requestPromiseMock = require("../mock/request-promise-mock")();
    // uriMock = require("../mock/uri-mock")();
    uri = require("urijs");
    Reference = require("../../lib/reference")(ArtifactMock, ArtifactSearchMock, loggerMock, hostMock, requestPromiseMock, uri);

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
    describe(".createSearch()", () => {
        it("instantiates a new ArtifactSearch", () => {
            var artifactSearch;

            expect(artifactSearch).toBeUndefined();
            artifactSearch = instance.createSearch(path);
            expect(artifactSearch instanceof ArtifactSearchMock).toBe(true);
        });
    });
    describe(".buildUrl()", () => {
        it("Adds the refName and 'artifact' to the uri", () => {
            var uriString;

            spyOn(Array.prototype, "unshift").andCallThrough();
            uriString = instance.buildUrl(path);
            expect(Array.prototype.unshift.callCount).toBe(2);
            expect(uriString).toBe("exampleRefName/artifact/some/example/path");
        });
        it("returns the URI as a string", () => {
            var uriString;

            uriString = instance.buildUrl("exampleRefName/artifact/some/example/path");
            expect(uriString).toBe("exampleRefName/artifact/some/example/path");
        });
    });
});

