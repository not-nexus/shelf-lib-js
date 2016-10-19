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

    // Grab a reference to a bucket.
    var reference = shelfLib.reference("refName", "<super secret pyshelf API key>");

    // Grab the artifact reference at location "/path".
    var artifact = reference.getArtifact("path");

    // Upload data to the artifact at "/path".
    artifact.upload("Hello data!").then((response) => {
        console.log(response);

        // Download the contents of the artifact.
        artifact.download().then((contents) => {
            console.log(contents);
        });

        // Get all of the artifact's metadata.
        artifact.metadata.getAll().then((metadata) => {
            console.log(metadata);
        });

        // Get one property of the artifact's metadata.
        artifact.metadata.getProperty("md5Hash").then((md5Hash) => {
            console.log(md5Hash);
        });
    });

    // Perfom a search on the root dir sorting by version.
    reference.search("", "artifactName=*", "version, VERSION").then((results) => {
        console.log(results);
    });
