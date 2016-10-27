"use strict";

module.exports = () => {
    var bluebird, methods, mock;

    bluebird = require("bluebird");
    methods = [
        "delete",
        "get",
        "post",
        "put"
    ];
    mock = jasmine.createSpyObj("requestPromiseMock", methods);

    methods.forEach((method) => {
        mock[method].andReturn(bluebird.resolve({}));
    });

    return mock;
};

