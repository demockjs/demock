(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'exports' ], function (exports) {
            factory((root.indexJson = exports));
        });
    } else if (typeof exports === 'object') {
        factory(exports);
    } else {
        factory((root.indexJson = {}));
    }
}(this, function (exports) {
    // @todo move these to a config object
    /**
     * The filter prefix
     *
     * Response filters are matched to properties in response data by this prefix + filter name.
     */
    exports.filterPrefix = '$';

    /**
     * The default document name
     *
     * Appended to paths for when the static web server is not configured to return a JSON document as a default document
     */
    exports.defaultDocument = 'index.json';

    /**
     * Request filters
     *
     * These are run against the request object when #filterRequest is called
     */
    exports.requestFilters = {
        /**
         * Converts all methods to GET by appending the original method name to the request URL
         */
        method: function (request) {
            if (request.method !== 'GET') {
                request.url = request.url.replace(/\/?$/, '/') + request.method;
                request.method = 'GET';
            }
        },
        /**
         * Appends the default document name to the request URL
         */
        defaultDocument: function (request) {
            request.url = request.url.replace(/\/?$/, '/' + exports.defaultDocument);
        }
    };

    /**
     * Response filters
     *
     * These are run against the response object when #filterResponse is called
     */
    exports.responseFilters = {
        /**
         * Delays the response by the specified milliseconds
         */
        delay: function (request, response, delay) {
            response.delay = delay;
        },
        /**
         * Overrides the HTTP response status code and status text
         */
        status: function (request, response, status) { // @todo statusCode & statusText?
            response.statusCode = status.code || response.statusCode;
            response.statusText = status.text || response.statusText;
        },
        /**
         * Simulates a connection timeout
         */
        // @todo let transport adaptors add these transport-specific filters?
        timeout: function (request, response) {
            response.timeout = true;
        },
        /**
         * Picks a response based on the specified property's values
         * Relies on $case and $default properties
         * $data should not be used with this
         */
        switch: function (request, response, paramName) {
            var cases = response.data[exports.filterPrefix + 'case'],
                paramValue = request.params && request.params[paramName];

            if (cases && cases.hasOwnProperty(paramValue)) {
                response.data = { $data: cases[paramValue] };
                return true;
            }

            var def = response.data[exports.filterPrefix + 'default'];

            if (def) {
                response.data = { $data: def };
                return true;
            }
        }
    };

    /**
     * Run all request filters on the given request object.
     *
     * @param {Object} request - The request object with properties:
     *                           method - The request method (uppercase: GET, POST, ...)
     *                           url - The request URL
     *                           params - The request parameters (query string or body)
     */
    exports.filterRequest = function (request) {
        for (var filterName in exports.requestFilters) {
            exports.requestFilters[filterName](request);
        }
    };

    /**
     * @param {Object} request - Same as in #filterRequest
     * @param {Object} response - The response object with properties:
     *                            statusCode - The HTTP status code (200, 400, etc.)
     *                            statusText - The HTTP status text (OK, Bad Request, etc.)
     *                                         Optional.
     *                            data - The response data. This is a JavaScript Object or Array.
     * @param filterArg - The filter argument. This is the value of the property of the response data being filtered.
     *                    Optional.
     * @returns {Boolean|undefined} - true when any filtering was done
     */
    exports.filterResponse = function (request, response) {
        function applyFilter(filterName, filterFn) {
            var filterArgsProp = exports.filterPrefix + filterName;

            if (response.data.hasOwnProperty(filterArgsProp)) {
                return filterFn(request, response, response.data[filterArgsProp]);
            }
        }

        if (response.data) {
            for (var filterName in exports.responseFilters) {
                applyFilter(filterName, exports.responseFilters[filterName]);
            }

            return applyFilter('data', function (request, response, data) {
                response.data = data;
                return true;
            });
        }
    };
}));
