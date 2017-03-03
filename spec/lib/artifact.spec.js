"use strict";

describe("lib/artifact", () => {
    var Artifact, authToken, bluebird, content, downloadLocation, error, fs, HttpLinkHeader, instance, logger, MetadataMock, requestMock, requestOptions, requestPromiseMock, responseHandler, responseMock, ShelfError, URI, uri;

    beforeEach(() => {
        authToken = "abcd1234";
        bluebird = require("bluebird");
        downloadLocation = "example/download/path";
        error = require("../../lib/error");
        fs = require("fs");
        logger = require("../../lib/logger")();
        MetadataMock = require("../mock/metadata-mock")();
        HttpLinkHeader = require("http-link-header");
        requestMock = require("../mock/request-mock")();
        requestOptions = require("../../lib/request-options")({
            strictHostCheck: true,
            timeoutDuration: 30
        }, logger);
        requestPromiseMock = require("../mock/request-promise-mock")();
        responseMock = require("../mock/response-mock")();
        ShelfError = require("../../lib/shelf-error")();
        uri = "http://api.gisnep.example.com";
        URI = require("urijs");
        responseHandler = require("../../lib/response-handler")(bluebird, error, HttpLinkHeader, logger, ShelfError, URI);
        Artifact = require("../../lib/artifact")(bluebird, fs, logger, requestMock, requestOptions, requestPromiseMock, responseHandler, MetadataMock);
        content = "someContent";
        instance = new Artifact(uri, authToken);
        spyOn(requestOptions, "createOptions").and.callThrough();
        spyOn(responseHandler, "handleErrorResponse").and.callThrough();
        spyOn(responseHandler, "resolveLink").and.callThrough();
        spyOn(responseHandler, "createErrorForResponse").and.callThrough();
        spyOn(bluebird, "fromCallback").and.callThrough();
    });
    describe(".upload()", () => {
        it("calls bluebird.fromCallback()", () => {
            bluebird.fromCallback.and.returnValue(bluebird.resolve({
                headers: {
                    location: "someLocation"
                }
            }));

            return instance.upload(content).then(() => {
                expect(bluebird.fromCallback).toHaveBeenCalled();
            });
        });
        it("posts", () => {
            requestMock.post.and.callFake((options, resolver) => {
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
                expect(requestOptions.createOptions).toHaveBeenCalled();
                expect(requestMock.post).toHaveBeenCalled();
            });
        });
        it("calls responseHandler.handleErrorResponse on error", () => {
            bluebird.fromCallback.and.returnValue(bluebird.resolve({
                statusCode: 404,
                headers: {
                    location: "someLocation"
                }
            }));

            return instance.upload(content).then(jasmine.fail, () => {
                expect(responseHandler.handleErrorResponse).toHaveBeenCalledWith({
                    statusCode: 404,
                    headers: {
                        location: "someLocation"
                    }
                });
            });
        });
        it("calls responseHandler.resolveLink", () => {
            bluebird.fromCallback.and.returnValue(bluebird.resolve({
                headers: {
                    location: "someLocation"
                }
            }));

            return instance.upload(content).then(() => {
                expect(responseHandler.resolveLink).toHaveBeenCalled();
            });
        });
    });
    describe(".uploadFromFile()", () => {
        beforeEach(() => {
            spyOn(fs, "createReadStream");
        });
        it("creates a read stream if the file is a string", () => {
            requestMock.post.and.callFake((options, resolver) => {
                resolver(null, {
                    statusCode: 404,
                    headers: {
                        location: "exampleLocation"
                    }
                });
            });

            return instance.uploadFromFile(content).then(jasmine.fail, () => {
                expect(responseHandler.handleErrorResponse).toHaveBeenCalled();
                expect(fs.createReadStream).toHaveBeenCalled();
                expect(requestOptions.createOptions).toHaveBeenCalled();
                expect(requestMock.post).toHaveBeenCalled();
            });
        });
        it("doesn't create a read stream if the file isn't a string", () => {
            requestMock.post.and.callFake((options, resolver) => {
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
                expect(requestOptions.createOptions).toHaveBeenCalled();
                expect(requestMock.post).toHaveBeenCalled();
            });
        });
    });
    describe(".download()", () => {
        it("calls requestPromise.get()", () => {
            return instance.download().then(() => {
                expect(requestOptions.createOptions).toHaveBeenCalled();
                expect(requestPromiseMock.get).toHaveBeenCalledWith({
                    headers: {
                        Authorization: "abcd1234"
                    },
                    resolveWithFullResponse: true,
                    json: true,
                    url: "http://api.gisnep.example.com",
                    timeout: 30
                });
            });
        });
        it("returns a response body", () => {
            requestPromiseMock.get.and.returnValue(bluebird.resolve({
                body: "responseBody"
            }));

            return instance.download().then((returnVal) => {
                expect(returnVal).toBe("responseBody");
            });
        });
        it("calls responseHandler.handleErrorResponse on error", () => {
            requestPromiseMock.get.and.returnValue(bluebird.reject({}));

            return instance.download().then(jasmine.fail, () => {
                expect(responseHandler.handleErrorResponse).toHaveBeenCalled();
            });
        });
    });
    describe(".downloadToFile()", () => {
        var promise;

        beforeEach(() => {
            spyOn(fs, "createWriteStream");
            requestMock.get = () => {
                setTimeout(() => {
                    requestMock.emit("response", responseMock);
                    responseMock.emit("finish");
                });

                return requestMock;
            };
            spyOn(responseHandler, "isErrorCode").and.returnValue(false);
            responseMock.pipe.and.returnValue(responseMock);
        });
        it("creates a write stream if the file is a string", () => {
            promise = instance.downloadToFile(downloadLocation);

            return promise.then(() => {
                expect(fs.createWriteStream).toHaveBeenCalled();
            });
        });
        it("does not create a write stream if the file is not a string", () => {
            downloadLocation = {};
            promise = instance.downloadToFile(downloadLocation);

            return promise.then(() => {
                expect(fs.createWriteStream).not.toHaveBeenCalled();
            });
        });
        it("rejects if the response is an error", () => {
            responseHandler.isErrorCode.and.returnValue(true);
            promise = instance.downloadToFile(downloadLocation);

            return promise.then(jasmine.fail, () => {
                expect(responseHandler.createErrorForResponse).toHaveBeenCalled();
            });
        });
        it("rejects on request error", () => {
            requestMock.get = () => {
                setTimeout(() => {
                    requestMock.emit("error", responseMock);
                    responseMock.emit("finish");
                });

                return requestMock;
            };
            promise = instance.downloadToFile(downloadLocation);

            return promise.then(jasmine.fail, () => {
                expect(responseHandler.createErrorForResponse).toHaveBeenCalled();
            });
        });
        it("rejects on response.pipe error", () => {
            requestMock.get = () => {
                setTimeout(() => {
                    requestMock.emit("response", responseMock);
                    responseMock.emit("error", {
                        code: "socket_timeout"
                    });
                });

                return requestMock;
            };
            promise = instance.downloadToFile(downloadLocation);

            return promise.then(jasmine.fail, () => {
                expect(responseHandler.createErrorForResponse).toHaveBeenCalled();
            });
        });
    });
});
