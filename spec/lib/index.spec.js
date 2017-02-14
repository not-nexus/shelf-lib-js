"use strict";

describe("lib/index", () => {
    var libConstructor;

    libConstructor = require("../..");
    it("fails with an invalid host prefix", () => {
        try {
            libConstructor("lol");
            jasmine.fail("Should have thrown an exception");
        } catch (err) {
            expect(err.code).toEqual(libConstructor.error.INVALID_HOST_PREFIX);
        }
    });
    it("still works when providing libOptions", () => {
        var lib, libOptions;

        libOptions = {
            strictHostCheck: false,
            logLevel: "info",
            timeoutDuration: 5
        };
        lib = libConstructor("https://api.shelf.com", libOptions);
        expect(lib.initReference).toEqual(jasmine.any(Function));
    });
    describe("initReference", () => {
        it("creates a Reference", () => {
            var lib, ref;

            lib = libConstructor("https://api.shelf-qa.com");
            ref = lib.initReference("fakeStorage", "abc123");
            expect(ref.constructor.name).toBe("Reference");
        });
    });
});
