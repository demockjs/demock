(function (root, factory) {
    // Based on https://github.com/umdjs/umd/blob/master/commonjsStrictGlobal.js
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
    exports.defaultDocument = 'index.json';

    exports.requestFilters = {
        method: function (request) {
            if (request.method !== 'GET') {
                request.url = request.url.replace(/\/?$/, '/') + request.method;
                request.method = 'GET';
            }
        },
        defaultDocument: function (request) {
            request.url = request.url.replace(/\/?$/, '/' + exports.defaultDocument);
            request.method = 'GET';            
        }
    };

    exports.responseFilters = {
        delay: function (request, response, delay) {
            response.delay = delay;
        },
        status: function (request, response, status) { // @todo statusCode & statusText?
            response.statusCode = status.code || response.statusCode;
            response.statusText = status.text || response.statusText;
        },
        // @todo let transport adaptors add these transport-specific filters?
        timeout: function (request, response) {
            response.timeout = true;
        },
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
        //parseerror: "msg" -> errormsg
        // random
        // list [ 1, 3, 4 ] -- fetch individual entities    
    };

    exports.filterRequest = function (request) {
        for (var filterName in exports.requestFilters) {
            exports.requestFilters[filterName](request);
        }
    };

    /**
     * @return true when any filtering was done
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
