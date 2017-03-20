/* eslint-disable no-invalid-this */
"use strict";


describe("lib/metadata", () => {
    var data, datum, error, interceptor, lib, metadata, Metadata, metaPath, nock, nockFactory, propPath, ShelfRequest, token, uri;

    lib = jasmine.createTestLib();
    error = lib.error;
    token = lib.token;
    nockFactory = require("nock");
    nock = nockFactory(lib.hostPrefix);
    uri = lib.uri;
    Metadata = lib.container.resolve("Metadata");
    ShelfRequest = lib.container.resolve("ShelfRequest");
    metaPath = `${uri.path()}/_meta`;
    propPath = `${metaPath}/prop`;
    datum = {
        name: "prop",
        value: "val",
        immutable: false
    };
    data = [
        datum,
        {
            name: "prop2",
            value: "val2",
            immutable: true
        }
    ];

    /**
     * @param {string} method
     * @param {string} successPath
     */
    function setupFailNock(method, successPath) {
        nock[method]((path) => {
            return path !== successPath;
        }).reply(500, {
            code: error.INTERNAL_SERVER,
            message: "MEANS THE PATH DIDN'T MATCH. THIS IS FROM NOCK."
        });
    }

    beforeEach(() => {
        metadata = new Metadata(uri, new ShelfRequest(token));
    });
    describe(".getAll()", () => {
        it("will get all metadata", () => {
            interceptor = nock.get(metaPath);
            interceptor.matchHeader("Authorization", token).reply(200, data);
            setupFailNock("get", metaPath);

            return metadata.getAll().then((body) => {
                expect(body).toEqual(data);
            });
        });
    });
    describe(".getProperty()", () => {
        it("will return a metadata property", () => {
            interceptor = nock.get(propPath);
            interceptor.matchHeader("Authorization", token).reply(200, datum);
            setupFailNock("get", propPath);

            return metadata.getProperty(datum.name).then((body) => {
                expect(body).toEqual(datum);
            });
        });
    });
    describe(".updateAll", () => {
        it("will send send the server the newest metadata", () => {
            interceptor = nock.put(metaPath);
            interceptor.matchHeader("Authorization", token).reply(200, data);
            setupFailNock("put", metaPath);

            return metadata.updateAll(data).then((body) => {
                expect(body).toEqual(data);
                expect(interceptor.body).toBe(JSON.stringify(data));
            });
        });
    });
    describe(".updateProperty", () => {
        it("will send the server the newest metadata", () => {
            interceptor = nock.put(propPath);
            interceptor.matchHeader("Authorization", token).reply(200, datum);
            setupFailNock("put", metaPath);

            return metadata.updateProperty(datum.name, datum).then((body) => {
                expect(body).toEqual(datum);
                expect(interceptor.body).toBe(JSON.stringify(datum));
            });
        });
    });
    describe(".createProperty", () => {
        it("will send the server a new metadata property", () => {
            interceptor = nock.post(propPath);
            interceptor.matchHeader("Authorization", token).reply(200, datum);
            setupFailNock("post", propPath);

            return metadata.createProperty(datum.name, datum).then((body) => {
                expect(body).toEqual(datum);
                expect(interceptor.body).toBe(JSON.stringify(datum));
            });
        });
    });
    describe(".deleteProperty", () => {
        it("will send the server a new metadata property", () => {
            interceptor = nock.delete(propPath);
            interceptor.matchHeader("Authorization", token).reply(204);
            setupFailNock("delete", propPath);

            return metadata.deleteProperty(datum.name).then((body) => {
                expect(body).toBeUndefined();
            });
        });
    });
    describe("input validation", () => {
        describe(".getProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return metadata.getProperty().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide the name for the property to get.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
        describe(".updateAll()", () => {
            it("rejects if metadata isn't provided", () => {
                return metadata.updateAll().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide metadata to update.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
        describe(".updateProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return metadata.updateProperty().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide the name for the property to update.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
            it("rejects if a property isn't provided", () => {
                var name;

                name = "someName";

                return metadata.updateProperty(name).then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide metadata to update.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
        describe(".createProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return metadata.createProperty().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide a name for the property to create.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
            it("rejects if a property isn't provided", () => {
                var name;

                name = "someName";

                return metadata.createProperty(name).then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide the property data to set.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
        describe(".deleteProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return metadata.deleteProperty().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide the name for the property to delete.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
    });
    afterAll(() => {
        // So we don't get any weird conflicts in other tests.
        nockFactory.cleanAll();
    });
});

