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

    function getPropertyByPath(object, path) {
        if (path) {
            var tokens = path.split('.');

            while (object && tokens.length) {
                object = object[tokens.shift()];
            }
        }

        return object;
    }

    function setPropertyByPath(object, path, value) {
        if (path) {
            var tokens = path.split('.');

            while (object && tokens.length > 1) {
                object = object[tokens.shift()];
            }

            object[tokens[0]] = value;
        }
    }

    function Demock() {
        var requestFilters = [],
            responseFilters = [],
            logFn;

        this.appendRequestFilter = function (filter) {
            requestFilters.push(filter);
            return this;
        };

        this.appendResponseFilter = function (filter) {
            responseFilters.push(filter);
            return this;
        };

        this.setLogger = function (newLogFn) {
            logFn = newLogFn;
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
                filter(request, logFn);
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
                filter(request, response, logFn);
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
                    request.headers = request.headers || {};

                    request.headers['X-MethodFilter-Original-URL'] = request.url;
                    request.headers['X-MethodFilter-Original-Method'] = request.method;

                    request.url = request.url.replace(/\/?$/, '/') + request.method + '/';
                    request.method = 'GET';

                    for (var paramName in request.params) {
                        request.headers['X-MethodFilter-Request-Param-' + paramName] = request.params[paramName];
                    }
                }
            };
        },
        /**
         * Appends the default document name to the request URL
         */
        defaultDocument: function (config) {
            return function (request) {
                request.headers = request.headers || {};

                request.headers['X-DefaultDocumentFilter-Original-URL'] = request.url;

                request.url = request.url.replace(/\/?$/, '/' + config.defaultDocument);
            };
        },

        requestSummary: function () {
            return function (request, logFn) {
                if (logFn) {
                    logFn('[requestSummary]', request.method, request.url, request.params);
                }
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
            return function (request, response) {
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
        },

        arrayFilter: function () {
            var matchers = {
                '=': function (paramValue, propValue) {
                    return '' + paramValue === '' + propValue;
                },
                '<=': function (paramValue, propValue) {
                    return paramValue <= propValue;
                },
                '>=': function (paramValue, propValue) {
                    return paramValue >= propValue;
                },
                ']': function (paramValue, propValue) {
                    return paramValue.indexOf(propValue) >= 0;
                }
            };

            return function (request, response) {
                if (response.data && response.data.$arrayFilter) {
                    var array = getPropertyByPath(response.data.$data, response.data.$arrayPath);

                    if (array instanceof Array && request.params) {
                        var filtered = array.filter(function (item) {
                            for (var paramName in response.data.$arrayFilter) {
                                if (request.params.hasOwnProperty(paramName)) {
                                    var filter = response.data.$arrayFilter[paramName],
                                        tokens = /^(=|<=|>=|])(.+)?$/.exec(filter);

                                    if (!tokens) {
                                        throw 'Invalid filter syntax ' + filter;
                                    }

                                    var propName = tokens[2] || paramName,
                                        matcher = matchers[tokens[1]];

                                    if (!matcher(request.params[paramName], item[propName])) {
                                        return false;
                                    }
                                }
                            }

                            return true;
                        });

                        array.length = 0;
                        array.push.apply(array, filtered);
                    }
                }
            };
        },

        arraySort: function () {
            return function (request, response) {
                if (response.data && response.data.$arraySort) {
                    var array = getPropertyByPath(response.data.$data, response.data.$arrayPath);

                    if (array instanceof Array && request.params && request.params.sortKey) {
                        array.sort(function (a, b) {
                            return ('' + a[request.params.sortKey]).localeCompare(
                                '' + b[request.params.sortKey]
                            ) * (request.params.sortDir === 'ASC' ? 1 : -1);
                        });
                    }
                }
            };
        },

        arrayWhenEmpty: function () {
            return function (request, response) {
                if (response.data && response.data.hasOwnProperty('$arrayWhenEmpty')) {
                    var array = getPropertyByPath(response.data.$data, response.data.$arrayPath);

                    if (array instanceof Array && !array.length) {
                        response.data.$data = response.data.$arrayWhenEmpty;
                    }
                }
            };
        },

        arrayItem: function () {
            return function (request, response) {
                if (response.data && response.data.hasOwnProperty('$arrayItem')) {
                    var array = getPropertyByPath(response.data.$data, response.data.$arrayPath);

                    if (array instanceof Array) {
                        var value;

                        switch (response.data.$arrayItem) {
                        case 'random':
                            value = array[Math.floor(array.length * Math.random())];
                            break;
                        default:
                            value = array[response.data.$arrayItem];
                            break;
                        }

                        setPropertyByPath(response.data.$data, response.data.$arrayPath, value);
                    }
                }
            };
        },

        doc: function () {
            return function (request, response, logFn) {
                if (logFn && response.data && response.data.$doc) {
                    response.data.$doc.forEach(function (text) {
                        logFn('[doc]', '(' + request.url + ')', text);
                    });
                }
            };
        },

        responseSummary: function () {
            return function (request, response, logFn) {
                if (logFn && response.data && !response.data.$data) {
                    logFn('[responseSummary]', request.url, response.statusCode, response.data);
                }
            };
        }
    };

    return Demock;
}));
