"use strict";

describe("lib/container", () => {
    var container, host, libOptions;

    host = "exampleHost";
    libOptions = {
        logLevel: "info"
    };
    beforeEach(() => {
        container = require("../../lib/container")(host, libOptions);
    });
    it("returns an object", () => {
        expect(container).toEqual(jasmine.any(Object));
    });
    it("resolves a dependency", () => {
        expect(container.resolve("container")).toBe(container);
    });
});
