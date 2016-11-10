"use strict";

module.exports = () => {
    var error;

    error = {
        DUPLICATE_ARTIFACT: "duplicate_artifact",
        INVALID_ARTIFACT_NAME: "invalid_artifact_name",
        METADATA_FORBIDDEN: "forbidden",
        NOT_FOUND: "resource_not_found",
        UNAUTHORIZED: "permission_denied",
        UNKNOWN: "UNKNOWN",
        INTERNAL_SERVER_ERROR: "internal_server_error",
        INCORRECT_PARAMETERS: "incorrect_parameters",
        FAILED_QUERY_VALIDATION: "failed_query_validation"
    };

    return error;
};
