"use strict";

module.exports = (error, host, ShelfError, libOptions) => {
    var container, Dizzy, moduleDefs;

    Dizzy = require("dizzy");
    container = new Dizzy();

    // Add the container so modules like storage can load additional dependencies
    container.register("container", container);

    // Register libOptions, logLevel, and host with Dizzy so they can be passed
    // into our dependencies.
    container.register("libOptions", libOptions);
    container.register("logLevel", libOptions.logLevel);
    container.register("host", host);
    container.register("ShelfError", ShelfError);
    container.register("error", error);

    // 3rd party libraries.
    // The key is the name in the container, the value is the name
    // of the module.
    moduleDefs = {
        bluebird: "bluebird",
        fs: "fs",
        parseLinkHeader: "parse-link-header",
        request: "request",
        requestPromise: "request-promise",
        URI: "urijs"
    };
    Object.keys(moduleDefs).forEach((moduleKey) => {
        container.register(moduleKey, moduleDefs[moduleKey]).fromModule();
    });

    // Our code is most often written as factories.
    // Register a bunch as
    // container.register(fileNameCamelCase, "file-name")
    //     .fromModule(__dirname).asFactory().cached();
    // The key is the name in the container, the value is the name of the file.
    moduleDefs = {
        Artifact: "./artifact",
        ArtifactSearch: "./artifact-search",
        dateService: "./date-service",
        logger: "./logger",
        Metadata: "./metadata",
        Reference: "./reference",
        requestOptions: "./request-options",
        responseHandler: "./response-handler"
    };
    Object.keys(moduleDefs).forEach((moduleKey) => {
        container.register(moduleKey, moduleDefs[moduleKey]).fromModule(__dirname).asFactory().cached();
    });

    return container;
};
