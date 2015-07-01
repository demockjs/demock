/**
 * @license Demock 0.2.0, Copyright (c) 2014, Ates Goral
 * Licensed under the MIT license.
 * See http://www.opensource.org/licenses/mit-license.php
 */
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
        var filters = [];

        this.use = function (filter) {
            filters.push(filter);
            return this;
        };

        /**
         * Run all request filters on the given request object.
         *
         * @param {Object} request - The request object with properties:
         *                           method - The request method (uppercase: GET, POST, ...)
         *                           url - The request URL
         *                           params - The request parameters (query string or body)
         */
        this.filterRequest = function (request) {
            filters.forEach(function (filter) {
                if (filter.filterRequest) {
                    filter.filterRequest(request);
                }
            });
        };

        /**
         * @param {Object} request - Same as in #filterRequest
         * @param {Object} response - The response object with properties:
         *                            statusCode - The HTTP status code (200, 400, etc.)
         *                            statusText - The HTTP status text (OK, Bad Request, etc.)
         *                                         Optional.
         *                            data - The response data.
         */
        this.filterResponse = function (request, response) {
            filters.forEach(function (filter) {
                if (filter.filterResponse) {
                    filter.filterResponse(request, response);
                }
            });

            if (response.data && response.data.$data) {
                response.data = response.data.$data;
                this.filterResponse(request, response);
            }
        };
    }

    Demock.filters = {
        method: function () {
            return {
                /**
                 * Converts all methods to GET by appending the original method name to the request URL
                 */
                filterRequest: function (request) {
                    if (request.method !== 'GET') {
                        request.url = request.url.replace(/\/?$/, '/') + request.method + '/';
                        request.method = 'GET';

                        for (var paramName in request.params) {
                            request.headers['X-Request-Param-' + paramName] = request.params[paramName];
                        }
                    }
                }
            };
        },
        defaultDocument: function (config) {
            return {
                /**
                 * Appends the default document name to the request URL
                 */
                filterRequest: function (request) {
                    request.url = request.url.replace(/\/?$/, '/' + config.defaultDocument);
                }
            };
        },
        delay: function () {
            return {
                /**
                 * Delays the response by the specified milliseconds
                 */
                filterResponse: function (request, response, delay) {
                    if (response.data && response.data.$delay) {
                        response.delay = response.data.$delay;
                    }
                }
            };
        },
        status: function () {
            return {
                /**
                 * Overrides the HTTP response status code and status text
                 */
                filterResponse: function (request, response) {
                    if (response.data && response.data.$status) {
                        response.statusCode = response.data.$status.code || response.statusCode;
                        response.statusText = response.data.$status.text || response.statusText;
                    }
                }
            };
        },
        timeout: function () {
            return {
                /**
                 * Simulates a connection timeout
                 */
                filterResponse: function (request, response) {
                    if (response.data && response.data.$timeout) {
                        response.timeout = true;
                    }
                }
            };
        },
        'switch': function () {
            return {
                /**
                 * Picks a response based on the specified property's values
                 * Relies on $case and $default properties
                 */
                filterResponse: function (request, response) {
                    if (response.data && response.data.$switch) {
                        var cases = response.data.$case,
                            paramValue = request.params && request.params[response.data.$switch];

                        if (cases && cases.hasOwnProperty(paramValue)) {
                            response.data = { $data: cases[paramValue] };
                            return;
                        }

                        response.data = { $data: response.data.$default };
                    }
                }
            };
        }
    };

    return Demock;
}));
