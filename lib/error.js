"use strict";

module.exports = () => {
    var error;

    error = {};
    error.DUPLICATE_ARTIFACT = "duplicate_artifact";
    error.INVALID_ARTIFACT_NAME = "invalid_artifact_name";
    error.METADATA_FORBIDDEN = "forbidden";
    error.NOT_FOUND = "resource_not_found";
    error.UNAUTHORIZED = "permission_denied";
    error.UNKNOWN = "UNKNOWN";
    error.INTERNAL_SERVER_ERROR = "internal_server_error";

    return error;
};
