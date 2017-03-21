"use strict";

module.exports = (logger, URI) => {
    /**
     * Concats pieces of a URI together.
     *
     * The first argument must contain the protocol and
     * host. The rest of the arguments can be path
     * fragements.
     *
     * @return {string}
     */
    function concatUri() {
        var args, path, uri;

        args = Array.prototype.slice.call(arguments);

        /* Remove falsy items in the arguments so that
         * the join functionality doesn't add double slashes.
         */
        args = args.filter((item) => {
            return !!item;
        });
        logger.debug("Arguments in concatUri", args);
        uri = new URI(args[0]);
        args[0] = uri.path();
        path = URI.joinPaths.apply(URI, args);
        uri.path(path);
        uri = uri.toString();
        logger.debug("Created uri in concatUri", uri);

        return uri;
    }

    return concatUri;
};
