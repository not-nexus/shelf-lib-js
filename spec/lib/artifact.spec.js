"use strict";

describe("lib/artifact", () => {
    var Artifact, authTokenMock, bluebird, content, downloadLocation, fs, instance, logger, MetadataMock, requestMock, requestOptionsMock, requestPromiseMock, responseHandlerMock, responseMock, uri;

    authTokenMock = "abcd1234";
    bluebird = require("bluebird");
    downloadLocation = "example/download/path";
    fs = require("fs");
    logger = require("../../lib/logger")();
    MetadataMock = require("../mock/metadata-mock")();
    requestMock = require("../mock/request-mock")();
    requestOptionsMock = require("../mock/request-options-mock")();
    requestPromiseMock = require("../mock/request-promise-mock")();
    responseHandlerMock = require("../mock/response-handler-mock")();
    responseMock = require("../mock/response-mock")();
    uri = "http://www.example.com";
    Artifact = require("../../lib/artifact")(bluebird, fs, logger, requestMock, requestOptionsMock, requestPromiseMock, responseHandlerMock, MetadataMock);
    beforeEach(() => {
        content = "someContent";
        instance = new Artifact(uri, authTokenMock);
    });
    describe(".upload()", () => {
        it("calls bluebird.fromCallback()", () => {
            spyOn(bluebird, "fromCallback").andReturn(bluebird.resolve({
                headers: {
                    location: "someLocation"
                }
            }));

            return instance.upload(content).then(() => {
                expect(bluebird.fromCallback).toHaveBeenCalled();
            });
        });
        it("posts", () => {
            requestMock.post.andCallFake((options, resolver) => {
                return {
                    form: () => {
                        return {
                            append: () => {
                                return resolver(null, {
                                    headers: {
                                        location: "someLocation"
                                    }
                                });
                            }
                        };
                    }
                };
            });

            return instance.upload(content).then(() => {
                expect(requestOptionsMock.createOptions).toHaveBeenCalled();
                expect(requestMock.post).toHaveBeenCalled();
            });
        });
        it("calls responseHandler.handleErrorResponse on error", () => {
            responseHandlerMock.isErrorCode.andReturn(true);
            spyOn(bluebird, "fromCallback").andReturn(bluebird.resolve({
                headers: {
                    location: "someLocation"
                }
            }));

            return instance.upload(content).then(() => {
                expect(responseHandlerMock.handleErrorResponse).toHaveBeenCalled();
            });
        });
        it("calls responseHandler.resolveLink", () => {
            spyOn(bluebird, "fromCallback").andReturn(bluebird.resolve({
                headers: {
                    location: "someLocation"
                }
            }));

            return instance.upload(content).then(() => {
                expect(responseHandlerMock.resolveLink).toHaveBeenCalled();
            });
        });
    });
    describe(".uploadFromFile()", () => {
        beforeEach(() => {
            responseHandlerMock.isErrorCode.andReturn(true);
            spyOn(fs, "createReadStream");
        });
        it("calls bluebird.fromCallback()", () => {
            spyOn(bluebird, "fromCallback").andReturn(bluebird.resolve({
                headers: {
                    location: "someLocation"
                }
            }));

            return instance.uploadFromFile(content).then(() => {
                expect(bluebird.fromCallback).toHaveBeenCalled();
            });
        });
        it("creates a read stream if the file is a string", () => {
            requestMock.post.andCallFake((options, resolver) => {
                resolver(null, {
                    statusCode: "exampleStatus",
                    headers: {
                        location: "exampleLocation"
                    }
                });
            });

            return instance.uploadFromFile(content).then(() => {
                expect(fs.createReadStream).toHaveBeenCalled();
                expect(requestOptionsMock.createOptions).toHaveBeenCalled();
                expect(requestMock.post).toHaveBeenCalled();
            });
        });
        it("doesn't create a read stream if the file isn't a string", () => {
            requestMock.post.andCallFake((options, resolver) => {
                resolver(null, {
                    statusCode: "exampleStatus",
                    headers: {
                        location: "exampleLocation"
                    }
                });
            });
            content = {};

            return instance.uploadFromFile(content).then(() => {
                expect(fs.createReadStream).not.toHaveBeenCalled();
                expect(requestOptionsMock.createOptions).toHaveBeenCalled();
                expect(requestMock.post).toHaveBeenCalled();
            });
        });
        it("calls responseHandler.handleErrorResponse on error", () => {
            responseHandlerMock.isErrorCode.andReturn(false);

            return instance.uploadFromFile(content).then(() => {
                expect(responseHandlerMock.handleErrorResponse).toHaveBeenCalled();
            });
        });
        it("calls responseHandler.resolveLink", () => {
            return instance.uploadFromFile(content).then(() => {
                expect(responseHandlerMock.resolveLink).toHaveBeenCalled();
            });
        });
    });
    describe(".download()", () => {
        it("calls requestPromise.get()", () => {
            return instance.download().then(() => {
                /* eslint-disable no-undefined */
                expect(requestOptionsMock.createOptions).toHaveBeenCalled();
                expect(requestPromiseMock.get).toHaveBeenCalledWith({
                    json: true,
                    url: "http://www.example.com",
                    formData: {
                        file: undefined
                    }
                });

                /* eslint-enable no-undefined */
            });
        });
        it("returns a response body", () => {
            requestPromiseMock.get.andReturn(bluebird.resolve({
                body: "responseBody"
            }));

            return instance.download().then((returnVal) => {
                expect(returnVal).toBe("responseBody");
            });
        });
        it("calls responseHandler.handleErrorResponse on error", () => {
            requestPromiseMock.get.andReturn(bluebird.reject());

            return instance.download().then(() => {
                expect(responseHandlerMock.handleErrorResponse).toHaveBeenCalled();
            });
        });
    });
    describe(".downloadToFile()", () => {
        var promise;

        /**
         * Handles requestMock and responseMock emits after necessary timeouts.
         */
        function handleEmit() {
            setTimeout(() => {
                requestMock.emit("response", responseMock);
                setTimeout(() => {
                    responseMock.emit("finish");
                }, 500);
            }, 250);
        }
        beforeEach(() => {
            spyOn(fs, "createWriteStream");
            requestMock.get.andReturn(requestMock);
            responseHandlerMock.isErrorCode.andReturn(false);
            responseMock.pipe.andReturn(responseMock);
        });
        it("creates a write stream if the file is a string", () => {
            promise = instance.downloadToFile(downloadLocation).then(() => {
                expect(fs.createWriteStream).toHaveBeenCalled();
            });
            handleEmit();

            return promise;
        });
        it("does not create a write stream if the file is not a string", () => {
            downloadLocation = {};
            promise = instance.downloadToFile(downloadLocation).then(() => {
                expect(fs.createWriteStream).not.toHaveBeenCalled();
            });
            handleEmit();

            return promise;
        });
        it("rejects if the response is an error", () => {
            responseHandlerMock.isErrorCode.andReturn(true);
            promise = instance.downloadToFile(downloadLocation).then(jasmine.fail, () => {
                expect(responseHandlerMock.createErrorForResponse).toHaveBeenCalled();
            });
            setTimeout(() => {
                responseMock.statusCode = "404";
                requestMock.emit("response", responseMock);
            }, 250);

            return promise;
        });
        it("rejects on request error", () => {
            promise = instance.downloadToFile(downloadLocation).then(jasmine.fail, () => {
                expect(responseHandlerMock.createErrorForResponse).toHaveBeenCalled();
            });
            setTimeout(() => {
                requestMock.emit("error", responseMock);
                setTimeout(() => {
                    responseMock.emit("finish");
                }, 500);
            }, 250);

            return promise;
        });
        it("rejects on response error", () => {
            promise = instance.downloadToFile(downloadLocation).then(() => {
                expect(responseHandlerMock.createErrorForResponse).toHaveBeenCalled();
            });
            setTimeout(() => {
                requestMock.emit("response", responseMock);
                setTimeout(() => {
                    responseMock.emit("error");
                }, 500);
            }, 250);

            return promise;
        });
    });
});
