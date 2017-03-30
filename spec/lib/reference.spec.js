"use strict";

describe("lib/reference", () => {
    var artifact, Artifact, ArtifactSearch, dateService, error, instance, lib, path, Reference;

    lib = jasmine.createTestLib();
    dateService = lib.container.resolve("dateService");
    error = lib.container.resolve("error");
    path = "test123";
    Artifact = lib.container.resolve("Artifact");
    ArtifactSearch = lib.container.resolve("ArtifactSearch");
    Reference = lib.container.resolve("Reference");

    /**
     * Makes sure an error happens while constructing a reference.
     *
     * @param {string} referenceName
     * @param {string} authenticationToken
     */
    function runErrorConstructor(referenceName, authenticationToken) {
        try {
            new Reference(referenceName, authenticationToken); // eslint-disable-line no-new
            jasmine.fail("Was expecting an error to be thrown");
        } catch (err) {
            expect(err.code).toBe(error.INCORRECT_PARAMETERS);
        }
    }

    beforeEach(() => {
        instance = new Reference("test", lib.token);
    });
    describe("constructor", () => {
        it("throws if a refName is falsy", () => {
            runErrorConstructor("", "abc123");
        });
        it("throws if a authToken is falsy", () => {
            runErrorConstructor("john", "");
        });
    });
    describe(".initArtifact()", () => {
        beforeEach(() => {
            artifact = instance.initArtifact(path);
        });
        it("instantiates a new Artifact", () => {
            expect(artifact).toEqual(jasmine.any(Artifact));
        });
        it("passes the full URI along to the Artifact", () => {
            expect(artifact.uri).toBe(lib.uri.toString());
        });
        it("passes the auth token to the ShelfRequest", () => {
            expect(artifact.shelfRequest.authToken).toBe(lib.token);
        });
    });
    describe(".initArtifactWithTimestamp()", () => {
        beforeEach(() => {
            spyOn(dateService, "now").and.returnValue("2016-12-06T15:58:59.670Z");
            artifact = instance.initArtifactWithTimestamp(path);
        });
        it("instantiates a new Artifact", () => {
            expect(artifact).toEqual(jasmine.any(Artifact));
        });
        it("passes the full URI along to the Artifact", () => {
            expect(artifact.uri).toBe(`${lib.uri.toString()}/2016-12-06T15:58:59.670Z`);
        });
        it("passes along the ShelfRequest", () => {
            expect(artifact.shelfRequest).toBe(instance.shelfRequest);
        });
    });
    describe(".initSearch()", () => {
        it("instantiates a new ArtifactSearch", () => {
            var artifactSearch;

            artifactSearch = instance.initSearch(path);
            expect(artifactSearch).toEqual(jasmine.any(ArtifactSearch));
            expect(artifactSearch.uri).toBe(`${lib.uri.toString()}/_search`);
        });
        it("instantiates a new ArtifactSearch without a path", () => {
            var artifactSearch, noPath;

            noPath = lib.uri.toString().replace(`/${path}`, "");
            artifactSearch = instance.initSearch();
            expect(artifactSearch).toEqual(jasmine.any(ArtifactSearch));
            expect(artifactSearch.uri).toBe(`${noPath}/_search`);
        });
        it("passes the authToken to the ShelfRequest", () => {
            var artifactSearch;

            artifactSearch = instance.initSearch();
            expect(artifactSearch.shelfRequest.authToken).toBe(lib.token);
        });
    });
    describe(".buildUrl()", () => {
        it("returns the URI as a string", () => {
            var uriString;

            uriString = instance.buildUrl("some/example/path");
            expect(uriString).toBe(`${lib.hostPrefix}/test/artifact/some/example/path`);
        });
    });
});

