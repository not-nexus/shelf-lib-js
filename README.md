shelf-lib-js
============


Introduction
------------

shelf-lib-js is a Node.js library for using pyshelf[https://github.com/kyle-long/pyshelf].


Installation
------------

To install shelf-lib-js for development, run the following commands:
    
    git clone https://github.com/GoogilyBoogily/shelf-lib-js.git
    cd shelf-lib-js
    npm install


Usage
-----

Example:

    // Import the library.
    var shelfLib = require("./lib/app")("<URL where pyshelf is hosted>");

    // Or, if you want verbose logging on the library:
    // var shelfLib = require("./lib/app")("<URL where pyshelf is hosted>", "debug");

    // Grab a reference to a bucket.
    var reference = shelfLib.getReference("refName", "<super secret pyshelf API key>");

    // Grab the artifact reference at location "/path".
    var artifact = reference.getArtifact("path");

    // Or, if you want to get a reference with a unique URL:
    var artifact = reference.getArtifact("path", true);

    // Upload data to the artifact at "/path".
    artifact.upload("Hello data!").then((response) => {
        console.log(response);

        // Download the contents of the artifact.
        artifact.download().then((contents) => {
            console.log(contents);
        });

        // Creates the mutable metadata property "tag" with value "Taggy-tag".
        artifact.metadata.createProperty("tag", {value: "Taggy-tag"}).then((response) => {
            console.log(response);
        });

        // Creates the immutable metadata property "tag1" with value "Tag-taggy".
        artifact.metadata.createProperty("tag1", {immutable: true, value: "Tag-taggy"}).then((response) => {
            console.log(response);
        });

        // Updates the metadata property "tag" with value "Data".
        artifact.metadata.updateProperty("tag", {value: "Data"}).then((response) => {
            console.log(response);
        });

        // Deletes the metadata property "tag"
        artifact.metadata.deleteProperty("tag").then((response) => {
            console.log(response);
        });

        // Get all of the artifact's metadata.
        artifact.metadata.getAll().then((metadata) => {
            console.log(metadata);
        });

        // Get one property of the artifact's metadata.
        artifact.metadata.getProperty("tag1").then((property) => {
            console.log(property);
        });
    });

    // Perfom a search on the root dir sorting by version.
    reference.search("", "artifactName=*", "version, VERSION").then((results) => {
        console.log(results);
    });
