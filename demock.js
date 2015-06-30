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
        root.demock = factory();
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
         * @returns {Object} - The request object.
         */
        this.filterRequest = function (request) {
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];

                if (filter.filterRequest) {
                    if (filter.filterRequest(request) === false) {
                        break;
                    }
                }
            }

            return request;
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
         */
        this.filterResponse = function (request, response) {
            function applyResponseFilter(filter) {
                var filterArgsProp = '$' + filter.key;

                if (response.data.hasOwnProperty(filterArgsProp)) {
                    return filter.filterResponse(request, response, response.data[filterArgsProp]);
                }
            }

            do {
                if (response.data) {
                    for (var i = 0; i < filters.length; i++) {
                        var filter = filters[i];

                        if (filter.filterResponse) {
                            if (applyResponseFilter(filter) === false) {
                                break;
                            }
                        }
                    }
                }
            } while (applyResponseFilter({
                key: 'data',
                /**
                 * Replaces the response payload with the specified data
                 * Always runs last
                 */
                filterResponse: function (request, response, data) {
                    response.data = data;
                    return true;
                }
            }));

            return response;
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
                key: 'delay',
                /**
                 * Delays the response by the specified milliseconds
                 */
                filterResponse: function (request, response, delay) {
                    response.delay = delay;
                }
            };
        },
        status: function () {
            return {
                key: 'status',
                /**
                 * Overrides the HTTP response status code and status text
                 */
                filterResponse: function (request, response, status) { // @todo statusCode & statusText?
                    response.statusCode = status.code || response.statusCode;
                    response.statusText = status.text || response.statusText;
                }
            };
        },
        timeout: function () {
            return {
                key: 'timeout',
                /**
                 * Simulates a connection timeout
                 */
                // @todo let transport adaptors add these transport-specific filters?
                filterResponse: function (request, response) {
                    response.timeout = true;
                }
            };
        },
        'switch': function () {
            return {
                key: 'switch',
                /**
                 * Picks a response based on the specified property's values
                 * Relies on $case and $default properties
                 * $data should not be used with this
                 */
                filterResponse: function (request, response, paramName) {
                    var cases = response.data.$case,
                        paramValue = request.params && request.params[paramName];

                    if (cases && cases.hasOwnProperty(paramValue)) {
                        response.data = { $data: cases[paramValue] };
                        return true;
                    }

                    var def = response.data.$default;

                    if (def) {
                        response.data = { $data: def };
                        return true;
                    }
                }
            };
        }
    };

    return Demock;
}));
