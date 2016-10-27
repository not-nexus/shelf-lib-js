"use strict";

describe("lib/metadata", () => {
    var authToken, instance, loggerMock, Metadata, requestOptionsMock, requestPromiseMock, responseHandlerMock, uri;

    loggerMock = require("../mock/logger-mock.js")();
    requestOptionsMock = require("../mock/request-options-mock")();
    requestPromiseMock = require("../mock/request-promise-mock")();
    responseHandlerMock = require("../mock/response-handler-mock")();
    Metadata = require("../../lib/metadata")(loggerMock, requestOptionsMock, requestPromiseMock, responseHandlerMock);
    beforeEach(() => {
        instance = new Metadata(uri, authToken);
    });
    [
        {
            fn: "getAll",
            verb: "get"
        }, {
            fn: "getProperty",
            input: "paramName",
            verb: "get"
        }, {
            fn: "updateAll",
            input: "paramMetadata",
            verb: "put"
        }, {
            fn: "updateProperty",
            input: [
                "paramName",
                "paramMetadata"
            ],
            verb: "put"
        }, {
            fn: "createProperty",
            input: [
                "paramName",
                "paramMetadata"
            ],
            verb: "post"
        }, {
            fn: "deleteProperty",
            input: "paramName",
            verb: "delete"
        }
    ].forEach((test) => {
        describe(test.fn, () => {
            it("calls the requestOptions.createOptions() method", () => {
                instance[test.fn](test.input);
                expect(requestOptionsMock.createOptions).toHaveBeenCalled();
            });
            it(`calls requestPromise.${test.verb}()`, () => {
                instance[test.fn](test.input);
                expect(requestPromiseMock[test.verb]).toHaveBeenCalled();
            });
            it("calls responseHandler.handleMetadataResponse()", () => {
                return instance[test.fn](test.input).then(() => {
                    expect(responseHandlerMock.handleMetadataResponse).toHaveBeenCalled();
                });
            });
        });
    });
});

