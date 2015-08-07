(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'module' ], function (module) {
            module.exports = factory();
        });
    } else if (typeof module === 'object') {
        module.exports = factory();
    } else {
        root.Demock = factory();
    }
}(this, function () {
    'use strict';

    function Demock() {
        var requestFilters = [],
            responseFilters = [];

        this.appendRequestFilter = function (filter) {
            requestFilters.push(filter);
            return this;
        };

        this.appendResponseFilter = function (filter) {
            responseFilters.push(filter);
            return this;
        };

        /**
         * Run all request filters on the given request object.
         *
         * @param {Object} request - The request object with properties:
         *                           method - The request method (uppercase: GET, POST, ...)
         *                           url - The request URL
         *                           headers - The request headers
         *                           params - The request parameters (query string or body)
         */
        this.filterRequest = function (request) {
            requestFilters.forEach(function (filter) {
                filter(request);
            });
        };

        /**
         * @param {Object} request - Same as in #filterRequest
         * @param {Object} response - The response object with properties:
         *                            statusCode - The HTTP status code (200, 400, etc.)
         *                            statusText - The HTTP status text (OK, Bad Request, etc.)
         *                                         Optional.
         *                            headers - The response headers
         *                            data - The response data.
         */
        this.filterResponse = function (request, response) {
            responseFilters.forEach(function (filter) {
                filter(request, response);
            });

            if (response.data && response.data.hasOwnProperty('$data')) {
                response.data = response.data.$data;
                this.filterResponse(request, response);
            }
        };
    }

    /**
     * Stock request filters
     */
    Demock.requestFilters = {
        /**
         * Converts all methods to GET by appending the original method name to the request URL
         */
        method: function () {
            return function (request) {
                if (request.method !== 'GET') {
                    request.url = request.url.replace(/\/?$/, '/') + request.method + '/';
                    request.method = 'GET';
                    request.headers = request.headers || {};

                    for (var paramName in request.params) {
                        request.headers['X-Request-Param-' + paramName] = JSON.stringify(request.params[paramName]);
                    }
                }
            };
        },
        /**
         * Appends the default document name to the request URL
         */
        defaultDocument: function (config) {
            return function (request) {
                request.url = request.url.replace(/\/?$/, '/' + config.defaultDocument);
            };
        }
    };

    /**
     * Stock response filters
     */
    Demock.responseFilters = {
        /**
         * Delays the response by the specified milliseconds
         */
        delay: function () {
            return function (request, response, delay) {
                if (response.data && response.data.$delay) {
                    response.delay = response.data.$delay;
                }
            };
        },
        /**
         * Overrides the HTTP response status code and status text
         */
        status: function () {
            return function (request, response) {
                if (response.data && response.data.$status) {
                    response.statusCode = response.data.$status.code || response.statusCode;
                    response.statusText = response.data.$status.text || response.statusText;
                }
            };
        },
        /**
         * Simulates a connection timeout
         */
        timeout: function () {
            return function (request, response) {
                if (response.data && response.data.$timeout) {
                    response.timeout = true;
                }
            };
        },
        /**
         * Picks a response based on the specified property's values
         * Relies on $case and $default properties
         */
        'switch': function () {
            return function (request, response) {
                if (response.data && response.data.$switch) {
                    var cases = response.data.$case,
                        paramValue = request.params && request.params[response.data.$switch];

                    if (cases && cases.hasOwnProperty(paramValue)) {
                        response.data = { $data: cases[paramValue] };
                        return;
                    }

                    response.data = { $data: response.data.$default };
                }
            };
        }
    };

    return Demock;
}));
