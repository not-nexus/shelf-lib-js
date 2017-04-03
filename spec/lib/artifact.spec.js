"use strict";

describe("lib/artifact", () => {
    var Artifact, artifact, artifactContent, error, filename, fs, host, lib, nock, ShelfRequest, streamBuffers, streamModule, token, uri;

    nock = require("nock");
    streamModule = require("stream");
    streamBuffers = require("stream-buffers");
    filename = "upload-download-test-file";
    lib = jasmine.createTestLib();
    uri = lib.uri;
    token = lib.token;
    artifactContent = "test123 content";
    host = lib.hostPrefix;

    beforeEach(() => {
        error = lib.error;
        ShelfRequest = lib.container.resolve("ShelfRequest");
        Artifact = lib.container.resolve("Artifact");
        artifact = new Artifact(uri.toString(), new ShelfRequest(token));
        fs = lib.container.resolve("fsAsync");
    });
    describe("upload method", () => {
        var fileContent, interceptor;

        // Buffer.from not supported in v4
        fileContent = new Buffer("This is some content");
        beforeEach(() => {
            var replyHeaders;

            // The shelf API returns the full URI as a location header.
            replyHeaders = {
                location: uri.toString()
            };
            interceptor = nock(host)
                .post(uri.path())
                .matchHeader("Authorization", token);

            interceptor.reply(201, "", replyHeaders)
                .post((path) => {
                    return path !== uri.path();
                })
                .reply(401, {
                    code: error.UNAUTHORIZED,
                    message: "MEANS THE PATH DIDN'T MATCH. THIS IS FROM NOCK."
                });
        });
        describe(".upload()", () => {
            /**
             * @param {(Buffer|string)} thing
             * @return {Promise.<undefined>}
             */
            function runUpload(thing) {
                return artifact.upload(thing).then((loc) => {
                    expect(loc).toBe("/test123");
                    expect(interceptor.req.headers["content-type"]).toContain("multipart/form-data; boundary=");
                });
            }
            it("will upload a string", () => {
                return runUpload("LOL HI");
            });
            it("will upload a buffer", () => {
                // Buffer.from not supported in v4
                return runUpload(new Buffer("LOL HI"));
            });
        });
        describe(".uploadFromFile()", () => {
            it("will upload the contents of a file", () => {
                return fs.writeFileAsync(filename, fileContent).then(() => {
                    return artifact.uploadFromFile(filename);
                }).then((loc) => {
                    expect(loc).toBe("/test123");

                    /* This is as close as I can get. I can't get access to the content that was streamed but
                     * I can at least see it was intended to be uploaded.
                     */
                    expect(interceptor.req.headers["content-type"]).toContain("multipart/form-data; boundary=");
                });
            });
            it("will upload the contents of a stream", () => {
                var stream, streamPromise;

                stream = new streamModule.Readable();
                stream.push("HELLO THERE");
                stream.push(null);

                /* The idea is this streamPromise will resolve
                 * when it is done streaming it to nock.
                 * Either that or the test will timeout.
                 */
                streamPromise = new Promise((resolve) => {
                    stream.on("end", () => {
                        resolve();
                    });
                });

                artifact.uploadFromFile(stream).then((loc) => {
                    expect(loc).toBe("/test123");

                    return streamPromise;
                });
            });
        });
    });
    describe("download method", () => {
        beforeEach(() => {
            var replyHeaders;

            replyHeaders = {
                "Content-Type": "application/octet-stream",
                "Content-Length": "15"
            };
            nock(host)
                .get(uri.path())
                .matchHeader("Authorization", token)
                .reply(200, artifactContent, replyHeaders)
                .get((path) => {
                    return path !== uri.path();
                })
                .reply(404, {
                    code: error.NOT_FOUND,
                    message: "REQUEST DID NOT MATCH THE EXPECTED URI"
                });
        });
        describe(".download()", () => {
            it("will return the artifact's contents", () => {
                return artifact.download().then((content) => {
                    expect(content).toBe(artifactContent);
                });
            });
        });
        describe(".downloadToFile()", () => {
            it("will write the contents of the artifact to a file name", () => {
                return artifact.downloadToFile(filename).then(() => {
                    return fs.readFileAsync(filename, "utf8");
                }).then((content) => {
                    expect(content).toBe(artifactContent);
                }).then(() => {
                    return fs.unlinkAsync(filename);
                }, () => {
                    return fs.unlinkAsync(filename);
                });
            });
            it("will write the contents of the artifact to a stream", () => {
                var stream;

                stream = new streamBuffers.WritableStreamBuffer();

                return artifact.downloadToFile(stream).then(() => {
                    expect(stream.getContentsAsString("utf8")).toBe(artifactContent);
                });
            });
            it("will reject if an error happens", () => {
                /* This test is in response to a bug where if
                 * an error occured specifically when downloading to
                 * a file it would blow up because it expected there
                 * to be a response body but there was not.
                 */
                artifact.uri = `${uri}/MAKE_IT_FAIL`;

                return artifact.downloadToFile(filename).then(jasmine.fail, (err) => {
                    expect(err.code).toBe(error.NOT_FOUND);
                });
            });
            it("does not attempt to cleanup a non-existant file", () => {
                var stream;

                stream = new streamBuffers.WritableStreamBuffer();
                artifact.uri = `${uri}/MAKE_IT_FAIL`;

                return artifact.downloadToFile(stream).then(jasmine.fail, (err) => {
                    expect(err.code).toBe(error.NOT_FOUND);
                });
            });
            it("logs errors that occur when attempting to cleanup file", () => {
                artifact.uri = `${uri}/MAKE_IT_FAIL`;
                spyOn(fs, "unlinkAsync").and.returnValue(Promise.reject(new Error("no")));

                return artifact.downloadToFile(filename).then(jasmine.fail, (err) => {
                    expect(err.code).toBe(error.NOT_FOUND);
                    fs.unlinkAsync.and.callThrough();

                    /* Serves dual purpose, removes the test file and blows up
                     * if it is not there. We spied on unlink and forced it to
                     * fail so the file should be there.
                     */
                    return fs.unlinkAsync(filename).then(null, () => {
                        throw new Error("Test expected a file to cleanup.");
                    });
                });
            });
        });
    });
    afterEach(() => {
        return fs.unlinkAsync(filename).then(null, (err) => {
            if (err.code !== "ENOENT") {
                throw err;
            }
        });
    });
    afterAll(() => {
        // So we don't get any weird conflicts in other tests.
        nock.cleanAll();
    });
});
