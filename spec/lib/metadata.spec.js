/* eslint-disable no-invalid-this */
"use strict";

describe("lib/metadata", () => {
    var authToken, bluebird, error, instance, logger, Metadata, requestOptions, requestPromiseMock, responseHandlerMock, ShelfError, uri;

    authToken = "abcd1234";
    bluebird = require("bluebird");
    error = require("../../lib/error")();
    logger = require("../../lib/logger")();
    requestOptions = require("../../lib/request-options")({
        strictHostCheck: true,
        timeoutDuration: 30
    }, logger);
    requestPromiseMock = require("../mock/request-promise-mock")();
    responseHandlerMock = require("../mock/response-handler-mock")();
    ShelfError = require("../../lib/shelf-error")();
    uri = "http://api.gisnep.example.com";
    Metadata = require("../../lib/metadata")(bluebird, error, logger, requestOptions, requestPromiseMock, responseHandlerMock, ShelfError);
    beforeEach(() => {
        instance = new Metadata(uri, authToken);
        spyOn(bluebird, "reject").and.callThrough();
        spyOn(requestOptions, "createOptions").and.callThrough();
    });
    [
        {
            fn: "getAll",
            verb: "get",
            expectedCall: {
                headers: {
                    Authorization: "abcd1234"
                },
                resolveWithFullResponse: true,
                json: true,
                url: "http://api.gisnep.example.com/_meta",
                timeout: 30
            }
        }, {
            fn: "getProperty",
            input: [
                "paramName"
            ],
            verb: "get",
            expectedCall: {
                headers: {
                    Authorization: "abcd1234"
                },
                resolveWithFullResponse: true,
                json: true,
                url: "http://api.gisnep.example.com/_meta/paramName",
                timeout: 30
            }
        }, {
            fn: "updateAll",
            input: [
                "paramMetadata"
            ],
            verb: "put",
            expectedCall: {
                headers: {
                    Authorization: "abcd1234"
                },
                resolveWithFullResponse: true,
                json: true,
                url: "http://api.gisnep.example.com/_meta",
                body: "paramMetadata",
                timeout: 30
            }
        }, {
            fn: "updateProperty",
            input: [
                "paramName",
                "paramProperty"
            ],
            verb: "put",
            expectedCall: {
                headers: {
                    Authorization: "abcd1234"
                },
                resolveWithFullResponse: true,
                json: true,
                url: "http://api.gisnep.example.com/_meta/paramName",
                body: "paramProperty",
                timeout: 30
            }
        }, {
            fn: "createProperty",
            input: [
                "paramName",
                "paramMetadata"
            ],
            verb: "post",
            expectedCall: {
                headers: {
                    Authorization: "abcd1234"
                },
                resolveWithFullResponse: true,
                json: true,
                url: "http://api.gisnep.example.com/_meta/paramName",
                body: "paramMetadata",
                timeout: 30
            }
        }, {
            fn: "deleteProperty",
            input: [
                "paramName"
            ],
            verb: "delete",
            expectedCall: {
                headers: {
                    Authorization: "abcd1234"
                },
                resolveWithFullResponse: true,
                json: true,
                url: "http://api.gisnep.example.com/_meta/paramName",
                timeout: 30
            }
        }
    ].forEach((test) => {
        describe(test.fn, () => {
            it(`calls requestPromise.${test.verb}()`, () => {
                instance[test.fn].apply(instance, test.input);
                expect(requestOptions.createOptions).toHaveBeenCalled();
                expect(requestPromiseMock[test.verb]).toHaveBeenCalledWith(test.expectedCall);
            });
            it("calls responseHandler.handleMetadataResponse()", () => {
                requestPromiseMock[test.verb].and.returnValue(bluebird.reject());

                return instance[test.fn].apply(this, test.input).then(() => {
                    expect(responseHandlerMock.handleErrorResponse).toHaveBeenCalled();
                });
            });
        });
        afterEach(() => {
            /*
            Replace the requestPromiseMock methods to clear the calls.
            .getProperty (2nd 'get' called) and .updateProperty (2nd 'put'
            called) tests will break if this cleanup isn't done.
            */
            requestPromiseMock[test.verb] = jasmine.createSpy(`${test.verb}`).and.returnValue(bluebird.resolve({}));
        });
    });
    describe("input validation", () => {
        describe(".getProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return instance.getProperty().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide the name for the property to get.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
        describe(".updateAll()", () => {
            it("rejects if metadata isn't provided", () => {
                return instance.updateAll().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide metadata to update.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
        describe(".updateProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return instance.updateProperty().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide the name for the property to update.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
            it("rejects if a property isn't provided", () => {
                var name;

                name = "someName";

                return instance.updateProperty(name).then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide metadata to update.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
        describe(".createProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return instance.createProperty().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide a name for the property to create.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
            it("rejects if a property isn't provided", () => {
                var name;

                name = "someName";

                return instance.createProperty(name).then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide the property data to set.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
        describe(".deleteProperty()", () => {
            it("rejects if a name isn't provided", () => {
                return instance.deleteProperty().then(jasmine.fail, (err) => {
                    expect(err.message).toBe("Must provide the name for the property to delete.");
                    expect(err.code).toBe("incorrect_parameters");
                });
            });
        });
    });
});

