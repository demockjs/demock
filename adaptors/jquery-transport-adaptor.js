/*$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    var request = {
        method: options.type.toUpperCase(),
        url: originalOptions.url,
        params: originalOptions.data
    };

    indexJson.filterRequest(request);

    options.type = request.method;
    options.url = request.url;
    options.data = request.params;

    jqXHR.__request = request;
});*/

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

        return ajax.call(this, settings).then(function (data, textStatus, jqXHR) {
            var response = {
                    //delay: 0,
                    //timeout: false,
                    statusCode: jqXHR.status,
                    statusText: jqXHR.statusText,
                    data: data
                },
                fakeXHR = $.Deferred();

            while (indexJson.filterResponse(request, response)) {}

            function resolve() {
                jqXHR.status = response.statusCode;
                jqXHR.statusText = response.statusText;
                //jqXHR.responseJSON = response.data;
                jqXHR.responseText = JSON.stringify(response.data);

                // @todo handle textStatus: "error", "abort", "parsererror"                    
                if (response.timeout) {
                    jqXHR.status = 0;
                    jqXHR.statusText = ''; // @todo check these
                    fakeXHR.reject(jqXHR, 'timeout');
                } else if (response.statusCode >= 400 && response.statusCode < 600) {
                    fakeXHR.reject(jqXHR, 'error', response.statusText);
                } else {
                    fakeXHR.resolve(response.data, textStatus, jqXHR);
                }
            }

            if (response.delay) {
                var timeout = window.setTimeout(resolve, response.delay);

                return fakeXHR.promise({
                    abort: function () {
                        if (timeout) {
                            window.clearTimeout(timeout);
                        }
                    }
                });
            } else {
                resolve();

                return fakeXHR.promise({
                    abort: $.noop
                });
            }
        });
    };
}($.ajax));
