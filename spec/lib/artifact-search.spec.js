"use strict";

describe("lib/artifact-search", () => {
    var ArtifactSearch, error, expectedLinkList, instance, lib, linkList, nock, nockFactory, replyHeaders, requestBody, searchParameters, ShelfRequest, token, uri;

    lib = jasmine.createTestLib();
    token = lib.token;
    ShelfRequest = lib.container.resolve("ShelfRequest");
    ArtifactSearch = lib.container.resolve("ArtifactSearch");
    uri = lib.uri;
    nockFactory = require("nock");
    nock = nockFactory(lib.hostPrefix);
    linkList = [
        `${uri.path()}/2016-11-23T16:03:05.239Z`,
        `${uri.path()}/2016-11-23T16:01:29.716Z`
    ];
    error = lib.error;

    /* It comes back in this format because I should be able
     * to provide this link directly to Reference.initArtifact
     * which does not include "<refName>/artifact"
     */
    expectedLinkList = [
        "/test123/2016-11-23T16:03:05.239Z",
        "/test123/2016-11-23T16:01:29.716Z"
    ];
    replyHeaders = {
        Link: []
    };
    linkList.forEach((item) => {
        replyHeaders.Link.push(`<${item}>; rel="item"; title="artifact"`);
    });

    replyHeaders.Link = replyHeaders.Link.join(",");
    beforeEach(() => {
        instance = new ArtifactSearch(uri.toString(), new ShelfRequest(token));
        nock.post(`${uri.path()}/_search`)
            .matchHeader("Authorization", token)
            .reply(201, (path, body) => {
                requestBody = body;
            }, replyHeaders);
    });
    describe(".search()", () => {
        it("returns an array of paths", () => {
            searchParameters = {
                search: [
                    "example=123",
                    "other=456"
                ]
            };

            return instance.search(searchParameters).then((pathList) => {
                expect(pathList).toEqual(expectedLinkList);
                expect(JSON.parse(requestBody)).toEqual(searchParameters);
            });
        });
        describe(".validateSearchItem()", () => {
            it("rejects if a search value doesn't provide the section when using the search string form =", () => {
                /* eslint-disable no-useless-escape */
                searchParameters = {
                    search: "Invalid\\=Query"
                };

                /* eslint-enable no-useless-escape */

                return instance.search(searchParameters).then(jasmine.fail, (err) => {
                    expect(err.code).toBe(error.FAILED_QUERY_VALIDATION);
                });
            });
            it("resolves a valid query", () => {
                searchParameters = {
                    search: "Valid=Query"
                };

                return instance.search(searchParameters);
            });
            it("resolves a valid query with '=*'", () => {
                searchParameters = {
                    search: "Valid=*Query"
                };

                return instance.search(searchParameters);
            });
            it("resolves a valid query with ~=", () => {
                searchParameters = {
                    search: "Valid~=Query"
                };

                return instance.search(searchParameters);
            });
            it("rejects if the query isn't a string", () => {
                searchParameters = {
                    search: {
                        query: "This won't work"
                    }
                };

                return instance.search(searchParameters).then(jasmine.fail, (err) => {
                    expect(err.code).toBe(error.FAILED_QUERY_VALIDATION);
                });
            });
        });
        describe(".validateSearch()", () => {
            it("resolves the promise if the query list is falsy", () => {
                return instance.search();
            });
            it("processes a single query", () => {
                searchParameters = {
                    search: "Valid=Query"
                };

                return instance.search(searchParameters);
            });
            it("processes an array of queries", () => {
                searchParameters = {
                    search: [
                        "firstValid=Query",
                        "secondValid=Query"
                    ]
                };

                return instance.search(searchParameters);
            });
        });
    });
    afterAll(() => {
        // So we don't get any weird conflicts in other tests.
        nockFactory.cleanAll();
    });
});
