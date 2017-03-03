"use strict";

module.exports = () => {
    var bluebird, methods, mock;

    bluebird = require("bluebird");
    methods = [
        "delete",
        "get",
        "post",
        "put"
    ];
    mock = jasmine.createSpyObj("requestPromiseMock", methods);

    methods.forEach((method) => {
        mock[method].and.returnValue(bluebird.resolve({
            headers: {
                link: "</morty/artifact/shelf-js-test/an-artifact/2016-11-23T16:03:05.239Z>; rel=\"item\"; title=\"artifact\", </morty/artifact/shelf-js-test/an-artifact/2016-11-23T16:01:29.716Z>; rel=\"item\"; title=\"artifact\""
            },
            request: {
                href: "https://api.shelf-qa.cwscloud.net/morty/artifact/_search"
            }
        }));
    });

    return mock;
};

