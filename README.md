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


API
---


#### `shelfLib(origin, [libOptions])`

* `origin` `{string}` - The protocol and host for connecting to Shelf. For example `https://api.shelf.com`.
* `libOptions` `{Object}` - An option object for configuring shelf-lib.
* Returns: `{Object}`.

The following are properties available in `libOptions`.

* `logLevel` `{string}` - Sets the desired amount of logging. Values can be: "info", "debug", or "warning". The value defaults to "warning". **WARNING:** If the logLevel is set to "debug", the logger will log your Shelf authentication token. Log with "debug" at your own peril.
* `strictHostCheck` `{boolean}` - Turns off request strictHostCheck. This defaults to `true`.
* `timeoutDuration` `{int}` - Sets the amount of time in milliseconds before requests timeout. This defaults to 300000 (five minutes).
* `retries` `{int}` - The number of times we should retry the request. This functionality applies to TCP level errors (socket timeout for example) and anything within the 500 HTTP status code range.

Example:

    var libOptions = {
        logLevel: "debug",
        strictHostCheck: false
    };

    var shelfLib = require("shelf-lib")("https://api.shelf.com", libOptions);


#### `shelfLib~initReference(refName, authToken)`

* `refName` `{string}` - Could also be called "bucket", "storage" or "shelf". This represents a specific storage space.
* `authToken` `{string}` - The authentication token used to authenticate with the `reference`
* Returns: `{Object}` - A [reference](#reference) object.

Example:

    var reference = shelfLib.initReference("shadow", "bDMKbnnzrDlmNs34NHGkvHOWDVdE4okV");


### reference

Represents what people might call a "reference name", "bucket", "storage" or "shelf". See [the Shelf documentation](https://github.com/not-nexus/shelf/blob/master/docs/configuration.md) for more information.


#### `reference~initArtifact(path)`

* `path` `{string}` - Just the path to the artifact inside of the reference. It is `<path>` in `https://api.shelf.com/shadow/artifact/<path>`.
* Returns: `{Object}` - An [artifact](#artifact) object.

Example:

    var artifact = reference.initArtifact("/my/path");


#### `reference~initArtifactWithTimestamp(path)`

* `path` `{string}` - Just the path to the artifact inside of the reference. It is `<path>` in `https://api.shelf.com/shadow/artifact/<path>/2016-11-01T14:37:04.151Z`.
* Returns: `{Object}`

Example:

    var artifact = reference.initWithTimestampArtifact("/my/path");


#### `reference.initSearch([path])`

Creates an [artifactSearch](#artifactsearch) object.

* `path` `{string}` - A path to a directory inside [reference](#reference). It is `<path>` in the following example `https://api.shelf.com/shadow/artifact/<path>/_search`.
* Returns: `{Object}` - An [artifactSearch](#artifactsearch) object.

Example:

    var artifactSearch = reference.initSearch("/my/path");


### artifact

Encapsulates functionality specific to an artifact like uploading and downloading.


#### `artifact~upload(content)`

Uploads the content provided to the path that the [artifact](#artifact) object to set up to point to. It returns a Promise which will resolve to have a path to where it was uploaded to. This should be usable with `reference~initArtifact`.

* `content` `{(string|Buffer|stream~ReadStream)}` - What you want uploaded as an artifact.
* Returns: `{Promise.<string>}`.

Example:

    artifact.upload("hello, this is an artifact").then((loc) => {
        console.log(`This is the location to where it was uploaded: ${loc}`);
    });


#### `artifact~uploadFromFile(file)`

Uploads the file provided to the path that the [artifact](#artifact) object is set up to point to. It returns a Promise which will resolve to have a path to where it was uploaded to. This should be usable with [reference](#reference)`.initArtifact`.

* `file` `{(string|stream~ReadStream)}` - If it is a string it should be the path to a file to upload.
* Returns: `{Promise.<string>}`.

Example:

    artifact.uploadFromFile("hello.txt").then((loc) => {
        console.log(`This is the location to where it was uploaded: ${loc}`);
    });


#### `artifact~download()`

Downloads the contents of the artifact and returns them as a UTF8 encoded string.

> **WARNING:** Do not use `artifact.download` for large artifacts. By default node's max memory size is 1.76GB (for 64 bit systems). This will blow up if your artifact is approaching that size. Use `artifact.downloadToFile` instead.

* Returns: `{Promise.<string>}`.

Example:

    artifact.download().then((content) => {
        console.log(`This is the contents of that artifact: ${content}`);
    });


#### `artifact~downloadToFile(file)`

Downloads the content of the aritfact to the file provided. This is a useful function to call for very large artifacts.

* `file` `{(string|stream~WriteStream)}` - If it is a string it must be the path to a file you wish to download the content to.
* Returns: `{Promise.<*>}`.

Example:

    artifact.downloadToFile("/my/file.txt").then(() => {
        console.log("Success");
    });


### metadata

An object which deals with metadata for a particular artifact.

    var metadata = artifact.metadata;

There are two structures used with metadata which are important.

First, there is `metadataProperty` which is an object with the following properties.

* `value` `{(string|boolean|int)}` - The value of the property.
* `immutable` `{boolean}` - If set to true, you will no be able to alter this property. This property is optional and will default to false.

Example:

    var metadataProperty = {
        value: "hello",
        immutable: false
    };

The Second one is called `metadataValues` which is an object whose keys are the name of a property and the value is a `metadataProperty`.

Example:

    var metadataValues = {
        hi: {
            value: "hello",
            immutable: false
        },
        version: {
            value: "1.0.0",
            immutable: true
        }
    };

#### `metadata.getAll()`

Gets all metadata for an [artifact](#artifact).

* Returns: `{Promise.<Object>}` - Resolves with a metadataValues object.

Example:

    metadata.getAll().then((metadataValues) => {
        console.log(metadataValues.hi.value); // "hello"
    });


#### `metadata.getProperty(name)`

Gets a specific metadataProperty.

* `name` `{string}` - The name of the property you wish to get.
* Returns: `{Promise.<Object>}` - Resolves with a metadataProperty.

Example:

    metadata.getProperty("hi").then((metadataProperty) => {
        console.log(metadataProperty.value); // "hello"
    });


#### `metadata.updateAll(metadataValues)`

Updates all metadata at once for a particular artifact. This should be used when bulk updates need to be made. For more information see the [Shelf Docs](https://github.com/not-nexus/shelf/blob/master/docs/api/metadata.md).

* `metadataValues` `{Object}` - A metadataValues object.
* Returns: `{Promise.<Object>}` - Resolves with a metadataValues object.

Example:

    /**
     * I only want to add a couple of properties without deleting any. In this case
     * I get the metadataValues object first.
     */
     metadata.getAll().then((metadataValues) => {
        metadataValues.someNewProperty = {
            value: 1
        };
        metadataValues.someOtherNewProperty = {
            value: 2
        };

        return metadata.updateAll(metadataValues);
     }).then((metadataValues) => {
        console.log("Success");
     });


#### `metadata.updateProperty(name, metadataProperty)`

Updates a single metadata property. This function will also create the property if it doesn't exist.

* `name` `{string}` - The name of the property you wish to update.
* `metadataProperty` `{Object}` - A metadataProperty object.
* Returns: `{Promise.<Object>}` - Resolves with a metadataProperty object.

Example:

    var metadataProperty = {
        value: "something",
        immutable: true
    };
    metadata.updateProperty("someProperty", metadataProperty).then((someProperty) => {
        console.log("Success");
    });


#### `metadata.createProperty(name, metadataProperty)`

Creates a single metadata property. This will error if the property already exists.

* `name` `{string}` - The name of the property you wish to create.
* `metadataProperty` `{Object}` - A metadataProperty object.
* Returns: `{Promise.<Object>}` - Resolves with a metadataProperty object.

Example:

    var metadataProperty = {
        value: "something",
        immutable: true
    };
    metadata.createProperty("someProperty", metadataProperty).then((someProperty) => {
        console.log("Success");
    });


#### `metadata.deleteProperty(name)`

Deletes a single property.

* `name` `{string}` - The name of the property you wish to delete.
* Returns: `{Promise.<*>}`

Example:

    metadata.deleteProperty("someProperty").then(() => {
        console.log("Success");
    });


### artifactSearch

Handles searching for artifacts by searchParameters.

* `search` `{(string|Array.<string>)}` - Each search item should be in the form `<metadataPropertyName><typeOfSearch><metadataValue>`. For example, if I wanted artifacts with a version of "1.0.0" I could search using `version=1.0.0`. For more information see [the Shelf Documentation][shelf-search].
* `sort` `{(string|Array.<string>)}` - Each sort item should be in the form `<metadataProperty, <sortFlags>...`. For more information see [the Shelf Documentation][shelf-search].
* `limit` `{int}` - The most amount of links  you would like back from a search.


#### `artifactSearch.search(searchParameters)`

Searches for artifacts.

* `searchParameters` `{Object}` - A searchParameters object.
* Returns: `{Promise.<Array.<string>>}` - A list of links. These links can be given directly to [reference](#reference)`.initArtifact` for uploading and downloading.

Example:

    searchParameters = {
        search: [
            "version~=1.0.0",
            "artifactName=john*"
        ],
        sort: "version, VER, DESC",
        limit: 1
    };
    artifactSearch.search(searchParameters).then((linkList) => {
        console.log(`Got links back: ${linkList}`);

        linkList.forEach((link) => {
            artifact = reference.initArtifact(link);

            // Do something with the artifact.
        });
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


[shelf-search]: https://github.com/not-nexus/shelf/blob/master/docs/api/search.md
