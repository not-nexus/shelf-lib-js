"use strict";

module.exports = () => {
    var bluebird, mock;

    bluebird = require("bluebird");
    mock = jasmine.createSpyObj("responseHandlerMock", [
        "handleArtifactResponse",
        "handleMetadataResponse"
    ]);
    mock.handleArtifactResponse.andReturn(bluebird.resolve({}));
    mock.handleMetadataResponse.andReturn(bluebird.resolve({}));

    return mock;
};

