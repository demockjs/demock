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
    exports.init = function ($) {
        $.ajax = (function (ajax) {
            return function (settings) {
                var request = {
                    method: settings.type ? settings.type.toUpperCase() : 'GET',
                    url: settings.url,
                    params: settings.data
                };

                indexJson.filterRequest(request);

                settings.type = request.method;
                settings.url = request.url;
                settings.data = request.params;
                settings.dataType = 'json';

                return ajax.call(this, settings).then(function (data, textStatus, jqXHR) {
                    var response = {
                            statusCode: jqXHR.status,
                            statusText: jqXHR.statusText,
                            data: data
                        },
                        dfd = $.Deferred();

                    while (indexJson.filterResponse(request, response)) {}

                    function resolve() {
                        jqXHR.status = response.statusCode;
                        jqXHR.statusText = response.statusText;
                        jqXHR.responseText = JSON.stringify(response.data);

                        // @todo handle textStatus: "error", "abort", "parsererror"
                        if (response.timeout) {
                            jqXHR.status = 0;
                            jqXHR.statusText = ''; // @todo check actual jQuery behaviour
                            dfd.reject(jqXHR, 'timeout');
                        } else if (response.statusCode >= 400 && response.statusCode < 600) {
                            dfd.reject(jqXHR, 'error', response.statusText);
                        } else {
                            dfd.resolve(response.data, textStatus, jqXHR);
                        }
                    }

                    if (response.delay) {
                        var timeout = window.setTimeout(resolve, response.delay);

                        return dfd.promise({
                            abort: function () {
                                if (timeout) {
                                    window.clearTimeout(timeout);
                                }
                            }
                        });
                    } else {
                        resolve();

                        return dfd.promise({
                            abort: $.noop
                        });
                    }
                });
            };
        }($.ajax));
    };
}));
