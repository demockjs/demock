// Based on https://github.com/umdjs/umd/blob/master/commonjsStrictGlobal.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([ 'exports' ], function (exports) {
            factory((root.indexJson = exports));
        });
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory((root.indexJson = {}));
    }
}(this, function (exports) {
    exports.filterPrefix = '$';

    exports.requestFilters = {
        method: function (request) {
            if (request.method !== 'GET') {
                request.url = request.url + request.method;
            }
        }
    };

    exports.responseFilters = {
        delay: function (request, response, delay) {
            response.delay = delay;
        },
        status: function (request, response, status) {
            response.statusCode = status.code || response.statusCode;
            response.statusText = status.text || response.statusText;
        },
        // @todo let transport adaptors add these transport-specific filters?
        timeout: function (request, response) {
            response.timeout = true;
        }
        // switch
        // random
        // list [ 1, 3, 4 ] -- fetch individual entities    
    };

    /**
     * @return true when any filtering was done
     */
    exports.filter = function (request, response) {
        var filtered = false;

        function applyFilter(filterName, filterFn) {
            var filterArgsProp = exports.filterPrefix + filterName;

            if (response.data.hasOwnProperty(filterArgsProp)) {
                filterFn(request, response, response.data[filterArgsProp]);
                filtered = true;
            }
        }

        if (response.data) {
            for (var filterName in exports.responseFilters) {
                applyFilter(filterName, exports.responseFilters[filterName]);
            }

            applyFilter('data', function (request, response, data) {
                response.data = data;
            });
        }

        return filtered;
    };
}));
