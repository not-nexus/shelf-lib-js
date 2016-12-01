"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("responseHandlerMock", [
        "createErrorForResponse",
        "handleErrorResponse",
        "isErrorCode",
        "resolveLink",
        "resolveLinkHeaders"
    ]);

    return mock;
};

