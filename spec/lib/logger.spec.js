"use strict";

describe("lib/logger", () => {
    var factory, logger;

    factory = (logLevel) => {
        return require("../../lib/logger")(logLevel);
    };

    it("sets logLevel to 'warning' by default", () => {
        logger = factory();
        expect(logger.level).toBe(4);
    });
    it("sets logLevel to info", () => {
        logger = factory("info");
        expect(logger.level).toBe(6);
    });
    it("throws if the logLevel isn't valid", () => {
        expect(() => {
            factory("DEFCON1");
        }).toThrow();
    });
});
