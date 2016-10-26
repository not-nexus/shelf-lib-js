"use strict";

describe("lib/dateService", () => {
    var dateService;

    dateService = require("../../lib/date-service")();

    describe(".now()", () => {
        it("returns a new date as an ISO string", () => {
            var now;

            now = dateService.now();
            expect(typeof now).toBe("string");
        });
    });
});
