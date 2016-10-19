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

Import the library

    var shelfLib = require("./lib/app")("<URL where pyshelf is hosted>");

Grab a reference to a bucket

    var reference = shelfLib.reference("<reference name>", "<super secret pyshelf API key>");

Grab an artifact reference

    var artifact = reference.getArtifact("<path/to/artifact>");

Upload to the artifact

    artifact.upload("Hello data!").then((response) => {
        console.log(response);
    });

Download the contents of the artifact

    artifact.download().then((contents) => {
        console.log(contents);
    });

Get all of the artifact's metadata

    artifact.metadata.getAll().then((metadata) => {
        console.log(metadata);
    });

Get one property of the artifact's metadata

    artifact.metadata.getProperty("md5Hash").then((md5Hash) => {
        console.log(md5Hash);
    });

Perfom a search on a reference

    reference.search("<path/to/search>", "<search criteria>", "<sort criteria>").then((results) => {
        console.log(results);
    });
