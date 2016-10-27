"use strict";

describe("lib/artifact", () => {
    var Artifact, authTokenMock, content, dateServiceMock, instance, loggerMock, requestOptionsMock, requestPromiseMock, responseHandlerMock, uriMock;

    authTokenMock = "abcd1234";
    dateServiceMock = jasmine.createSpyObj("dateServiceMock", [
        "now"
    ]);
    loggerMock = require("../mock/logger-mock.js")();

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

    requestOptionsMock = require("../mock/request-options-mock")();
    requestPromiseMock = require("../mock/request-promise-mock")();
    responseHandlerMock = require("../mock/response-handler-mock")();
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
            it(`calls requestPromise.${test.verb}()`, () => {
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
