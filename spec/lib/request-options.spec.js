"use strict";

describe("lib/requestOptions", () => {
    var authToken, libOptions, loggerMock, options, requestOptionsFactory;

    authToken = "abcd1234";
    loggerMock = require("../mock/logger-mock")();
    requestOptionsFactory = () => {
        return require("../../lib/request-options")(loggerMock, libOptions);
    };

    describe(".createOptions()", () => {
        it("sets rejectUnauthorized if the strictHostCheck flag isn't set", () => {
            libOptions = {
                strictHostCheck: false
            };
            options = requestOptionsFactory().createOptions(authToken);
            expect(options.rejectUnauthorized).toBe(false);
        });
        it("returns an options object", () => {
            libOptions = {
                strictHostCheck: true
            };
            options = requestOptionsFactory().createOptions(authToken);
            expect(options).toEqual({
                headers: {
                    Authorization: "abcd1234"
                },
                json: true,
                resolveWithFullResponse: true,
                simple: false
            });
        });
    });
});
