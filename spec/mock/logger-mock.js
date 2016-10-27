"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("loggerMock", [
        "debug"
    ]);

    return mock;
};

