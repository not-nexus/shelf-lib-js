"use strict";

describe("lib/requestOptions", () => {
    var authToken, libOptions, logger, options, requestOptionsFactory;

    authToken = "abcd1234";
    logger = require("../../lib/logger")();
    requestOptionsFactory = () => {
        return require("../../lib/request-options")(libOptions, logger);
    };

    describe(".createOptions()", () => {
        it("sets rejectUnauthorized if the strictHostCheck flag isn't set", () => {
            libOptions = {
                strictHostCheck: false
            };
            options = requestOptionsFactory().createOptions(authToken);
            expect(options.rejectUnauthorized).toBe(false);
        });
        it("timeDuration for request options", () => {
            libOptions = {
                strictHostCheck: false,
                timeoutDuration: 10
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
                resolveWithFullResponse: true
            });
        });
    });
});
