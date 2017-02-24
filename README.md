shelf-lib-js
============

[![Build Status](https://travis-ci.org/not-nexus/shelf-lib-js.svg?branch=master)](https://travis-ci.org/not-nexus/shelf-lib-js)
[![codecov.io](https://codecov.io/github/not-nexus/shelf-lib-js/coverage.svg?branch=master)](https://codecov.io/github/not-nexus/shelf-lib-js?branch=master)

Introduction
------------

shelf-lib-js is a Node.js library for using [shelf](https://github.com/not-nexus/shelf).


Installation
------------

To install shelf-lib-js for development, run the following commands:

    git clone https://github.com/not-nexus/shelf-lib-js.git
    cd shelf-lib-js
    npm install


Usage
-----

    // Import the library.
    var shelfLib = require("shelf-lib")("<URL where pyshelf is hosted>");


Options
-----------

The second parameter when requiring the library is an object holding various options that can change the behavior of the library.

* `logLevel` - Sets the desired amount of logging. Values can be: "info", "debug", or "warning". The value defaults to "warning". WARNING: If the logLevel is set to "debug", the logger will log your Shelf authentication token. Log with "debug" at your own peril.
* `strictHostCheck` - Turns off request strictHostCheck. This defaults to `true`.
* `timeoutDuration` - Sets the amount of time in milliseconds before requests timeout. This defaults to 60000.

Example:

    var libOptions = {
        logLevel: "debug",          // Sets the desired amount of logging.
                                    // Values can be: "info", "debug", or "warning".
                                    // Defaults to "warning".
        "strictHostCheck": false    // Turns off request strictHostCheck.
                                    // Defaults to true.
    };

    var shelfLib = require("shelf-lib")("<URL where shelf is hosted>", libOptions);


Reference Creation
------------------

    // Grab a reference to a bucket.
    var reference = shelfLib.initReference("refName", "<super secret pyshelf API key>");


Artifact Reference Creation
---------------------------

    // Grab the artifact reference at location "/path".
    var artifact = reference.initArtifact("path");


Uploading
---------

To upload an artifact with the contents from a variable:

    artifact.upload("Hello world!").then((uploadLocation) => {
        console.log("Uploaded content to: " + uploadLocation);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

To upload an artifact from a file:

    artifact.uploadFromFile("./file-to-upload.txt").then((uploadLocation) => {
        console.log("Uploaded content to: " + uploadLocation);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

Or:

    var fileReadStream = fs.createReadStream("./file-to-upload.txt");

    artifact.uploadFromFile(fileReadStream).then((uploadLocation) => {
        console.log("Uploaded content to: " + uploadLocation);
    }, (err) => {
        console.log("Hit an error: " + err);
    });


Downloading
-----------

To download the contents and receive it in a variable:

    artifact.download().then((data) => {
        console.log("Got data: " + data);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

To upload an artifact from a file:

    artifact.uploadFromFile("./file-with-artifact-contents.txt").then((uploadLocation) => {
        console.log("Uploaded contents to: " + downloadLocation);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

Or:

    var fileReadStream = fs.createReadStream("./file-with-artifact-contents.txt");

    artifact.downloadToFile(fileReadStream).then((downloadLocation) => {
        console.log("Downloaded contents to: " + downloadLocation);
    }, (err) => {
        console.log("Hit an error: " + err);
    });


Dealing With Metadata
---------------------

Getting metadata:

    // Get all of the artifact's metadata.
    artifact.metadata.getAll().then((metadata) => {
        console.log(metadata);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

    // Get one property of the artifact's metadata.
    artifact.metadata.getProperty("tag1").then((property) => {
        console.log(property);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

Creating and updating metadata on an artifact:

    // Creates the mutable metadata property "tag" with value "Taggy-tag".
    var tagProperty = {
        value: "Taggy-tag"
    };
    artifact.metadata.createProperty("tag", tagProperty).then((response) => {
        console.log(response);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

    // Creates the immutable metadata property "tag1" with value "Tag-taggy".
    var tagProperty1 = {
        immutable: true,
        value: "Tag-taggy"
    };
    artifact.metadata.createProperty("tag1", tagProperty1).then((response) => {
        console.log(response);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

    // Updates the metadata property "tag" with value "Data".
    var tagUpdate = {
        value: "Data"
    };
    artifact.metadata.updateProperty("tag", tagUpdate).then((updatedProperty) => {
        console.log(updatedProperty);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

    // Updates all of the metadata on an artifact.
    var tagUpdateAll = {
        value: "Data",
        value2: "Data2"
    }
    artifact.metadata.updateAll(tagUpdateAll).then((updatedProperties) => {
        console.log(updatedProperties);
    }, (err) => {
        console.log("Hit an error: " + err);
    });

Deleting metadata:

    // Deletes the metadata property "tag" (only deletes the property if its mutable).
    artifact.metadata.deleteProperty("tag").then(() => {
        console.log("Successfully deleted the property.");
    }, (err) => {
        console.log("Hit an error: " + err);
    });


Searching
---------

In order to search for an artifact, you need to first create an ArtifactSearch instance with the path you want to preform the search on.

    var artifactSearch = reference.initSearch("pathy/");

Then you must construct an object with your search parameters.

    var searchParameters = {
        search: "artifactName=*",   // Can be a string, an array of strings, or can also be undefined (optional).
        sort: "version, VERSION",   // Can be a string or undefined (optional).
        limit: 3                    // Can be a number or undefined (optional).
    };

Finally, you can perform the search with your constructed parameters:

    artifactSearch.search(searchParameters).then((results) => {
        console.log(results);
    }, (err) => {
        console.log("Hit an error: " + err);
    });


Errors
------

Shelf Lib will reject with special `ShelfError` errors. These inherit from `Error` so they can either be treated generically or if you would like to programmatically code against specific errors you can use the `error` and `ShelfError` properties on the Shelf Lib constructor. For example

    var artifact, shelfLibConstructor, shelfLib, ref;

    shelfLibConstructor = require("shelf-lib");
    shelfLib = shelfLibConstructor("https://api.shelf.com");
    ref = shelfLib.initReference("fake", "INVALID_TOKEN");
    artifact = ref.initArtifact("/fake/path");

    artifact.upload("fake contents").then(() => {
        console.log("Everything uploaded fine.");
    }, (err) => {
        if (err.code == shelfLibConstructor.error.UNAUTHORIZED) {
            console.log("Our token was invalid");
        } else {
            throw err;
        }
    });

For more information see the [error module](https://github.com/not-nexus/shelf-lib-js/blob/master/lib/error.js).
