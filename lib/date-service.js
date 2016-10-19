"use strict";

module.exports = () => {
    /**
     * Gets a UTC date string in ISO format.
     *
     * @return {string}
     */
    function now() {
        return new Date().toISOString();
    }

    return {
        now
    };
};
