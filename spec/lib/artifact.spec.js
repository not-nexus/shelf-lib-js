"use strict";

describe("lib/artifact", () => {
    var Artifact, authTokenMock, bluebird, content, downloadLocation, error, fs, instance, logger, MetadataMock, parseLinkHeader, requestMock, requestOptions, requestPromiseMock, responseHandler, responseMock, ShelfError, URI, uri;

    authTokenMock = "abcd1234";
    bluebird = require("bluebird");
    downloadLocation = "example/download/path";
    error = require("../../lib/error");
    fs = require("fs");
    logger = require("../../lib/logger")();
    MetadataMock = require("../mock/metadata-mock")();
    parseLinkHeader = require("parse-link-header");
    requestMock = require("../mock/request-mock")();
    requestOptions = require("../../lib/request-options")({
        strictHostCheck: true
    }, logger);
    requestPromiseMock = require("../mock/request-promise-mock")();
    responseMock = require("../mock/response-mock")();
    ShelfError = require("../../lib/shelf-error")();
    uri = "http://api.gisnep.example.com";
    URI = require("urijs");
    responseHandler = require("../../lib/response-handler")(bluebird, error, logger, parseLinkHeader, ShelfError, URI);
    Artifact = require("../../lib/artifact")(bluebird, fs, logger, requestMock, requestOptions, requestPromiseMock, responseHandler, MetadataMock);
    beforeEach(() => {
        content = "someContent";
        instance = new Artifact(uri, authTokenMock);
        spyOn(requestOptions, "createOptions").andCallThrough();
        spyOn(responseHandler, "handleErrorResponse").andCallThrough();
        spyOn(responseHandler, "resolveLink").andCallThrough();
        spyOn(responseHandler, "createErrorForResponse").andCallThrough();
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
                expect(requestOptions.createOptions).toHaveBeenCalled();
                expect(requestMock.post).toHaveBeenCalled();
            });
        });
        it("calls responseHandler.handleErrorResponse on error", () => {
            spyOn(bluebird, "fromCallback").andReturn(bluebird.resolve({
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
            spyOn(bluebird, "fromCallback").andReturn(bluebird.resolve({
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
            requestMock.post.andCallFake((options, resolver) => {
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
                    url: "http://api.gisnep.example.com"
                });
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
            requestPromiseMock.get.andReturn(bluebird.reject({}));

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
            spyOn(responseHandler, "isErrorCode").andReturn(false);
            responseMock.pipe.andReturn(responseMock);
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
            responseHandler.isErrorCode.andReturn(true);
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
