(function (root, factory) {
    // Based on https://github.com/umdjs/umd/blob/master/commonjsStrictGlobal.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([ 'exports' ], function (exports) {
            factory((root.indexJsonTransport = exports));
        });
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory((root.indexJsonTransport = {}));
    }
}(this, function (exports) {
    exports.init = function () {
        return [ '$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push(function () {
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
                    }
                    // response: function () {
                    //     console.dir(arguments);
                    // }
                };
            });
        }];
    };
}));
