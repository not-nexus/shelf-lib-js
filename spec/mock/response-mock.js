"use strict";

var events;

events = require("events");

module.exports = () => {
    var eventEmitter, response;

    response = jasmine.createSpyObj("response", [
        "pipe"
    ]);

    // Inherit methods from EventEmitter to get "on", "emit", "once", etc.
    eventEmitter = new events.EventEmitter();
    [
        "emit",
        "on",
        "once"
    ].forEach((methodName) => {
        response[methodName] = eventEmitter[methodName].bind(eventEmitter);
        spyOn(response, methodName).andCallThrough();
    });

    return response;
};
