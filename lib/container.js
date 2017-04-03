"use strict";

module.exports = (error, host, ShelfError, libOptions) => {
    var container, Dizzy, moduleDefs, superagent;

    Dizzy = require("dizzy");
    require("dizzy-promisify-bluebird")(Dizzy);
    container = new Dizzy();

    // Add the container so modules like storage can load additional dependencies
    container.register("container", container);

    /* Register libOptions, logLevel, and host with Dizzy so they can be passed
     * into our dependencies.
     */
    container.register("libOptions", libOptions);
    container.register("logLevel", libOptions.logLevel);
    container.register("host", host);
    container.register("ShelfError", ShelfError);
    container.register("error", error);

    /* 3rd party libraries.
     * The key is the name in the container, the value is the name
     * of the module.
     */
    moduleDefs = {
        bluebird: "bluebird",
        fs: "fs",
        HttpLinkHeader: "http-link-header",
        URI: "urijs"
    };
    container.registerBulk(moduleDefs).fromModule();

    // The key is the name in the container, the value is the name of the file.
    moduleDefs = {
        Artifact: "./artifact",
        ArtifactSearch: "./artifact-search",
        concatUri: "./concat-uri",
        dateService: "./date-service",
        logger: "./logger",
        Metadata: "./metadata",
        Reference: "./reference",
        responseHandler: "./response-handler",
        ShelfRequest: "./shelf-request"
    };
    container.registerBulk(moduleDefs).fromModule(__dirname).asFactory().cached();
    superagent = require("superagent");
    require("superagent-promise")(superagent, Promise);
    container.register("superagent", superagent);
    container.register("fsAsync", "fs").fromModule().promisified().cached();


    return container;
};
