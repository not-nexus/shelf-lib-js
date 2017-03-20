"use strict";

describe("lib/shelf-request", () => {
    var lib, nock, nockFactory, shelfRequest, ShelfRequest, streamBuffers;

    lib = jasmine.createTestLib("warning", 100);
    ShelfRequest = lib.container.resolve("ShelfRequest");
    nockFactory = require("nock");
    nock = nockFactory(lib.hostPrefix);
    streamBuffers = require("stream-buffers");
    beforeEach(() => {
        shelfRequest = new ShelfRequest(lib.token);
    });
    describe(".downloadToStream()", () => {
        it("Will reject on a timeout error", () => {
            var stream;

            nock.get(lib.uri.path())
                .times(4)
                .delay(1000)
                .reply(200, "SHOULD NEVER GET THE RESPONSE");
            stream = new streamBuffers.WritableStreamBuffer();

            return shelfRequest.downloadToStream(lib.uri.toString(), stream).then(jasmine.fail, (err) => {
                expect(err.code).toBe(lib.error.TIMEOUT);
            });
        });
        it("Will reject if the stream is closed", () => {
            var stream;

            nock.get(lib.uri.path())
                .reply(200, "Hi");
            stream = new streamBuffers.WritableStreamBuffer();
            stream.end();

            return shelfRequest.downloadToStream(lib.uri.toString(), stream).then(jasmine.fail, (err) => {
                expect(err.message).toBe("write after end");
                expect(err.code).toBe(lib.error.UNKNOWN);
            });
        });
    });
    describe("error handling", () => {
        it("Is handled automatically for all requests", () => {
            nock.put(lib.uri.path())
                .reply(400, {
                    code: lib.error.INVALID_REQUEST_DATA_FORMAT,
                    message: "bad thing"
                });

            return shelfRequest.put(lib.uri.toString(), "hi").then(jasmine.fail, (err) => {
                expect(err.code).toBe(lib.error.INVALID_REQUEST_DATA_FORMAT);
            });
        });
        it("can recover from failures by retrying", () => {
            nock.get(lib.uri.path())
                .reply(500, "OH NO")
                .get(lib.uri.path())
                .reply(200, "k its fine now");

            return shelfRequest.get(lib.uri.toString()).then((response) => {
                expect(response.text).toBe("k its fine now");
            });
        });
    });
    afterAll(() => {
        nockFactory.cleanAll();
    });
});
