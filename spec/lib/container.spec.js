"use strict";
var error, ShelfError;

error = require("../../lib/error")();
ShelfError = require("../../lib/shelf-error")();

describe("lib/container", () => {
    var container, host, libOptions;

    host = "exampleHost";
    libOptions = {
        logLevel: "info"
    };
    beforeEach(() => {
        container = require("../../lib/container")(error, host, ShelfError, libOptions);
    });
    it("returns an object", () => {
        expect(container).toEqual(jasmine.any(Object));
    });
    it("resolves a dependency", () => {
        expect(container.resolve("container")).toBe(container);
    });
});
