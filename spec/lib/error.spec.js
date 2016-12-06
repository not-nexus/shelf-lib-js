"use strict";

describe("lib/error", () => {
    var error;

    error = require("../../lib/error")();

    it("returns an object", () => {
        expect(error).toEqual(jasmine.any(Object));
    });
});
