"use strict";

module.exports = () => {
    var error;

    error = {
        INVALID_REQUEST_DATA_FORMAT: "invalid_request_data_format",
        DUPLICATE_ARTIFACT: "duplicate_artifact",
        FAILED_QUERY_VALIDATION: "failed_query_validation",
        INCORRECT_PARAMETERS: "incorrect_parameters",
        INTERNAL_SERVER_ERROR: "internal_server_error",
        INVALID_ARTIFACT_NAME: "invalid_artifact_name",
        METADATA_FORBIDDEN: "forbidden",
        NOT_FOUND: "resource_not_found",
        TIMEOUT: "ECONNABORTED",
        COULD_NOT_RESOLVE_HOST: "ENOTFOUND",
        CONNECTION_REFUSED: "ECONNREFUSED",
        UNAUTHORIZED: "permission_denied",
        INVALID_HOST_PREFIX: "invalid_host_prefix",
        UNKNOWN: "UNKNOWN"
    };

    return error;
};
