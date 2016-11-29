"use strict";

module.exports = () => {
    /**
     * An extended error class that has a code property in addition to a message.
     */
    class ExtendedError extends Error {
        /**
         * @param {*} message
         * @param {*} code
         */
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }

    return ExtendedError;
};

