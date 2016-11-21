/* eslint-disable no-invalid-this */
"use strict";

describe("lib/metadata", () => {
    var authToken, bluebird, error, instance, logger, Metadata, requestOptionsMock, requestPromiseMock, responseHandlerMock, uri;

    bluebird = require("bluebird");
    error = require("../../lib/error")();
    logger = require("../../lib/logger")();
    requestOptionsMock = require("../mock/request-options-mock")();
    requestPromiseMock = require("../mock/request-promise-mock")();
    responseHandlerMock = require("../mock/response-handler-mock")();
    Metadata = require("../../lib/metadata")(bluebird, error, logger, requestOptionsMock, requestPromiseMock, responseHandlerMock);
    beforeEach(() => {
        instance = new Metadata(uri, authToken);
        spyOn(bluebird, "reject").andCallThrough();
    });
    [
        {
            fn: "getAll",
            verb: "get"
        }, {
            fn: "getProperty",
            input: [
                "paramName"
            ],
            verb: "get"
        }, {
            fn: "updateAll",
            input: [
                "paramMetadata"
            ],
            verb: "put"
        }, {
            fn: "updateProperty",
            input: [
                "paramName",
                "paramProperty"
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
            input: [
                "paramName"
            ],
            verb: "delete"
        }
    ].forEach((test) => {
        describe(test.fn, () => {
            it("calls the requestOptions.createOptions() method", () => {
                instance[test.fn].apply(this, test.input);
                expect(requestOptionsMock.createOptions).toHaveBeenCalled();
            });
            it(`calls requestPromise.${test.verb}()`, () => {
                instance[test.fn].apply(this, test.input);
                expect(requestPromiseMock[test.verb]).toHaveBeenCalled();
            });
            it("calls responseHandler.handleMetadataResponse()", () => {
                requestPromiseMock[test.verb].andReturn(bluebird.reject());

                return instance[test.fn].apply(this, test.input).then(() => {
                    expect(responseHandlerMock.handleErrorResponse).toHaveBeenCalled();
                });
            });
        });
        afterEach(() => {
            /*
            Restore the requestPromiseMock methods to original implementation.
            .getProperty (2nd 'get' called) and .updateProperty (2nd 'put'
            called) tests will break if this cleanup isn't done.
            */
            requestPromiseMock[test.verb].andReturn(bluebird.resolve({}));
        });
    });
    describe("input validation", () => {
        describe(".getProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return instance.getProperty().then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
        });
        describe(".updateAll()", () => {
            it("rejects if metadata isn't provided", () => {
                return instance.updateAll().then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
        });
        describe(".updateProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return instance.updateProperty().then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
            it("rejects if a property isn't provided", () => {
                var name;

                name = "someName";

                return instance.updateProperty(name).then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
        });
        describe(".createProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return instance.createProperty().then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
            it("rejects if a property isn't provided", () => {
                var name;

                name = "someName";

                return instance.createProperty(name).then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
        });
        describe(".deleteProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return instance.deleteProperty().then(jasmine.fail, () => {
                    expect(bluebird.reject).toHaveBeenCalled();
                });
            });
        });
    });
});

