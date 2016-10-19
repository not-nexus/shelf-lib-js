#!/usr/bin/env node
"use strict";

var args, doc, docopt, manager;

docopt = require("docopt");

doc = `
Library to interact with the Shelf API.

Usage:
    ./bin/app.js [options] <host> <refName> <environment> <role> <action> <authToken>

    Arguments:
        host                The URL where Shelf is located.
                            For example, localhost:8080

        refName             The name of the bucket we're to access.

        environment         The name of the environment you wish to
                            upload, download, or search for data.
                            For example, everyday-heroes-prod.

        role                The role you want to upload, download,
                            or search for data. For example, mongodb.

        action              The action you wish to take.
                            Possible values are: "upload", "download",
                            or "search"

        authToken           The token to authorize access to Shelf.

    Options:
        -v --verbose        Turn on debug logging.
`;

args = docopt.docopt(doc, {
    version: "0.0.1"
});
manager = require("../lib/main")(args);

manager.run();
