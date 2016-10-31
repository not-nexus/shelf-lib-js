"use strict";

module.exports = () => {
    var error;

    error = {};
    error.DUPLICATE_ARTIFACT = {
        code: "duplicate_artifact",
        message: "This artifact already exists and you are not allowed to overwrite it."
    };
    error.INVALID_ARTIFACT_NAME = {
        code: "invalid_artifact_name",
        message: "The name of the artifact was invalid."
    };
    error.METADATA_FORBIDDEN = {
        code: "forbidden",
        message: "The metadata item tag is immutable."
    };
    error.NOT_FOUND = {
        code: "resource_not_found",
        message: "Resource not found."
    };
    error.UNAUTHORIZED = {
        code: "permission_denied",
        message: "Permission denied."
    };
    error.UNKNOWN = {
        code: "UNKNOWN",
        message: "Unknown error."
    };
    error.INTERNAL_SERVER_ERROR = {
        code: "internal_server_error",
        message: "Internal server error."
    };

    return error;
};
