"use strict";

/**
 * @typedef {Object} arguments
 * @property {string} environment
 * @property {string} project
 * @property {string} role
 * @property {string} verbose
 */

/**
 * @param {Object} args - Raw arguments object from docopt.
 * @return {arguments}
 */
module.exports = (args) => {
    var newArgs, project;

    // Remove everything after the last dash.
    project = args["<environment>"].replace(/-([^\-]*)$/, "");

    newArgs = {
        host: args["<host>"],
        refName: args["<refName>"],
        environment: args["<environment>"],
        project,
        role: args["<role>"],
        action: args["<action>"],
        authToken: args["<authToken>"],
        verbose: args["--verbose"]
    };

    return newArgs;
};
