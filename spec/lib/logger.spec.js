"use strict";

describe("lib/logger", () => {
    var factory, Log, logger, ShelfError;

    Log = require("Log");
    ShelfError = require("../../lib/shelf-error")();
    factory = (logLevel) => {
        return require("../../lib/logger")(ShelfError, logLevel);
    };

    it("sets logLevel to 'warning' by default", () => {
        logger = factory();
        expect(logger.level).toBe(Log.WARNING);
    });
    it("sets logLevel to info", () => {
        logger = factory("info");
        expect(logger.level).toBe(Log.INFO);
    });
    it("throws if the logLevel isn't valid", () => {
        expect(() => {
            factory("DEFCON1");
        }).toThrow();
    });
    it("sets logLevel to debug", () => {
        logger = factory("debug");
        expect(logger.level).toBe(Log.DEBUG);
    });
});
