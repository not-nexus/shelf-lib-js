"use strict";

describe("lib/artifact", () => {
    var Artifact, authTokenMock, bluebird, content, dateServiceMock, instance, loggerMock, requestOptionsMock, requestPromiseMock, responseHandlerMock, uriMock;

    authTokenMock = "abcd1234";
    bluebird = require("bluebird");
    dateServiceMock = jasmine.createSpyObj("dateServiceMock", [
        "now"
    ]);
    loggerMock = jasmine.createSpyObj("loggerMock", [
        "debug"
    ]);

    /**
     * A mock Metadata class.
     */
    class MetadataMock {
        /**
         * @param {string} authToken
         * @param {string} uri
         */
        constructor(authToken, uri) {
            this.authToken = authToken;
            this.uri = uri;
        }
    }
    requestOptionsMock = jasmine.createSpyObj("requestOptionsMock", [
        "createOptions"
    ]);
    requestOptionsMock.createOptions.andReturn({});
    requestPromiseMock = jasmine.createSpyObj("requestPromiseMock", [
        "get",
        "post"
    ]);
    requestPromiseMock.post.andReturn(bluebird.resolve({}));
    requestPromiseMock.get.andReturn(bluebird.resolve({}));
    responseHandlerMock = jasmine.createSpyObj("responseHandlerMock", [
        "handleArtifactResponse"
    ]);
    responseHandlerMock.handleArtifactResponse.andReturn(bluebird.resolve({}));
    uriMock = "www.example.com";
    Artifact = require("../../lib/artifact")(dateServiceMock, loggerMock, requestOptionsMock, requestPromiseMock, responseHandlerMock, MetadataMock);

    beforeEach(() => {
        content = "someContent";
        instance = new Artifact(uriMock, authTokenMock);
    });
    [
        {
            fn: "upload",
            verb: "post"
        }, {
            fn: "uploadWithTimestamp",
            verb: "post"
        }, {
            fn: "download",
            verb: "get"
        }
    ].forEach((test) => {
        describe(test.fn, () => {
            it("calls the requestOptions.createOptions() method", () => {
                instance[test.fn](content);
                expect(requestOptionsMock.createOptions).toHaveBeenCalled();
            });
            it("calls requestPromise.post() with the options", () => {
                instance[test.fn](content);
                expect(requestPromiseMock[test.verb]).toHaveBeenCalled();
            });
            it("calls responseHandler.handleArtifactResponse()", () => {
                return instance[test.fn](content).then(() => {
                    expect(responseHandlerMock.handleArtifactResponse).toHaveBeenCalled();
                });
            });
        });
    });
});
