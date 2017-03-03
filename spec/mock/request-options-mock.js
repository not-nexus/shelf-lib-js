"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("requestOptionsMock", [
        "createOptions"
    ]);
    mock.createOptions.and.returnValue({});

    return mock;
};

