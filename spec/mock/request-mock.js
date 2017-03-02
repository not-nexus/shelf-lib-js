"use strict";

var DelayedEventEmitter;

DelayedEventEmitter = require("./delayed-event-emitter");

module.exports = () => {
    var requestMock;

    requestMock = new DelayedEventEmitter();

    [
        "post",
        "get"
    ].forEach((method) => {
        requestMock[method] = jasmine.createSpy(method);
    });

    return requestMock;
};
