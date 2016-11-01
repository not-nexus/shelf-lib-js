"use strict";

module.exports = (host, libOptions) => {
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

    moduleDefs = {
        parseLinkHeader: "parse-link-header",
        requestPromise: "request-promise-native",
        URI: "urijs"
    };
    Object.keys(moduleDefs).forEach((moduleKey) => {
        container.register(moduleKey, moduleDefs[moduleKey]).fromModule();
    });
    moduleDefs = {
        Artifact: "./artifact",
        ArtifactSearch: "./artifact-search",
        dateService: "./date-service",
        error: "./error",
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
