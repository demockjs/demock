(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'exports' ], function (exports) {
            factory((root.indexJsonTransport = exports));
        });
    } else if (typeof exports === 'object') {
        factory(exports);
    } else {
        factory((root.indexJsonTransport = {}));
    }
}(this, function (exports) {
    exports.init = function () {
        return [ '$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push([ '$q', '$window', function ($q, $window) {
                return {
                    request: function (config) {
                        var request = {
                            method: config.method,
                            url: config.url,
                            params: config.data
                        };

                        indexJson.filterRequest(request);

                        config.method = request.method;
                        config.url = request.url;
                        config.data = request.params;

                        return config;
                    },
                    response: function (_response) {
                        var request = {
                                params: _response.config.data
                            },
                            response = {
                                statusCode: _response.status,
                                data: _response.data
                            },
                            dfd = $q.defer();

                        while (indexJson.filterResponse(request, response)) {}

                        function resolve() {
                            _response.status = response.statusCode;
                            _response.data = response.data;

                            if (response.timeout) {
                                _response.statusCode = 404; // @todo Current Angular behaviour is 404. Might change to 0 in the future.
                                dfd.reject(_response);
                            } else if (response.statusCode >= 400 && response.statusCode < 600) {
                                dfd.reject(_response);
                            } else {
                                dfd.resolve(_response);
                            }
                        }

                        if (response.delay) {
                            var timeout = $window.setTimeout(resolve, response.delay);

                            // @todo needs testing
                            if (_response.config.timeout && _response.config.timeout.then) {
                                _response.config.timeout.then(function () {
                                    $window.clearTimeout(timeout);
                                });
                            }

                            return dfd.promise;
                        } else {
                            resolve();
                            return dfd.promise;
                        }
                    }
                };
            }]);
        }];
    };
}));
