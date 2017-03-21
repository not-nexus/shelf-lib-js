"use strict";
var URI;

URI = require("urijs");
jasmine.createTestLib = (logLevel, timeoutDuration) => {
    var hostPrefix, libOptions, shelfLib, shelfLibFactory, uri;

    logLevel = logLevel || "warning";
    timeoutDuration = timeoutDuration || 500;
    uri = new URI("https://api.shelf.com/test/artifact/test123");
    hostPrefix = `${uri.protocol()}://${uri.host()}`;
    shelfLibFactory = require("../../lib");
    libOptions = {
        logLevel,
        timeoutDuration,
        retries: 1
    };
    shelfLib = shelfLibFactory(hostPrefix, libOptions);

    return {
        uri,
        hostPrefix,
        container: shelfLib.container,
        lib: shelfLib,
        error: shelfLibFactory.error,
        token: "SUPER_SECRET_TOKEN"
    };
};
