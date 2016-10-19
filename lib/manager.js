"use strict";

/**
 * @typedef {Object} manager
 * @function run
 */

/**
 * Creates a manager.
 *
 * @param {arguments} args
 * @param {bluebird} bluebird
 * @param {log~Log} logger
 * @param {Class} ShelfFile
 * @param {Object} utils
 * @return {manager}
 */
module.exports = (args, bluebird, logger, ShelfFile, utils) => {
    /**
     * The main entry point for the library. Will kick off the whole process.
     */
    function run() {
        var shelfFile, shelfPath, shelfUri;

        shelfPath = utils.buildPath(args);
        shelfUri = utils.buildUrl(shelfPath, args.host, args.refName);

        shelfFile = new ShelfFile(shelfPath, args.host, shelfUri, args.authToken);
        logger.debug(`Created shelfFile object: ${JSON.stringify(shelfFile, null, 4)}`);

        shelfFile.upload("Hello there!").then((data) => {
            logger.debug(`Got body: ${JSON.stringify(data, null, 4)}`);
        });

        // returnVal = shelfFile.metadata.deleteProperty("tag");
    }

    return {
        run
    };
};
