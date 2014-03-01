define([
    'intern!bdd',
    'intern/chai!expect',
    'src/index.json'
], function (bdd, expect, indexJson) {
    'use strict';

    var describe = bdd.describe,
        before = bdd.before,
        after = bdd.after,
        beforeEach = bdd.before,
        afterEach = bdd.after,
        it = bdd.it;

    describe('indexJson', function () {

        describe('#filterPrefix', function () {

            it('should be set to $ by default', function () {
                expect(indexJson.filterPrefix).to.equal('$');
            });
        });

        describe('#defaultDocument', function () {

            it('should be set to index.json by default', function () {
                expect(indexJson.defaultDocument).to.equal('index.json');
            });
        });

        describe('#filterRequest()', function () {
            var defaultFilters;

            before(function() {
                defaultFilters = indexJson.requestFilters;
            });

            after(function () {
                indexJson.requestFilters = defaultFilters;
            });
        });
    });

    describe('default request filters', function () {

        describe('method filter', function () {

            describe('with a GET request', function () {

                it('should leave the method and the URL untouched', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test'
                    };

                    indexJson.requestFilters.method(request);

                    expect(request.method).to.equal('GET');
                    expect(request.url).to.equal('/api/test');
                });
            });

            describe('with a non-GET request', function () {

                it('should change the method to GET', function () {
                    var request = {
                        method: 'NONGET',
                        url: '/api/test'
                    };

                    indexJson.requestFilters.method(request);

                    expect(request.method).to.equal('GET');
                });

                describe('with URL with no trailing /', function () {

                    it('should append the method name as subfolder to the URL path', function () {
                        var request = {
                            method: 'NONGET',
                            url: '/api/test'
                        };

                        indexJson.requestFilters.method(request);

                        expect(request.url).to.equal('/api/test/NONGET');
                    });
                });

                describe('with URL with trailing /', function () {

                    it('should append the method name as subfolder to the URL path', function () {
                        var request = {
                            method: 'NONGET',
                            url: '/api/test/'
                        };

                        indexJson.requestFilters.method(request);

                        expect(request.url).to.equal('/api/test/NONGET');
                    });
                });
            });
        });

        describe('defaultDocument filter', function () {

            describe('with URL with no trailing /', function () {

                it('should append the configured default document filename to the URL path', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test'
                    };

                    indexJson.requestFilters.defaultDocument(request);

                    expect(request.url).to.equal('/api/test/index.json');
                });
            });

            describe('with URL with trailing /', function () {

                it('should append the configured default document filename to the URL path', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test/'
                    };

                    indexJson.requestFilters.defaultDocument(request);

                    expect(request.url).to.equal('/api/test/index.json');
                });
            });
        });
    });

    describe('default response filters', function () {

        describe('data filter', function () {

            it('should replace the response payload with the argument', function () {
                var replacement = {};

                var response = {
                    data: {}
                };

                indexJson.responseFilters.data({}, response, replacement);

                expect(response.data).to.equal(replacement);
            });
        });

        describe('delay filter', function () {

        });

        describe('status filter', function () {

            describe('when argument is an object', function () {

                describe('the code property', function () {

                    it('should override the HTTP response status code', function () {

                        var response = {
                            statusCode: 200,
                            statusText: 'OK'
                        };

                        indexJson.responseFilters.status({}, response, { code: 400 });

                        expect(response.statusCode).to.equal(400);
                        expect(response.statusText).to.equal('OK');
                    });
                });

                describe('the text property', function () {

                    it('should override the HTTP response status text', function () {

                        var response = {
                            statusCode: 200,
                            statusText: 'OK'
                        };

                        indexJson.responseFilters.status({}, response, { text: 'Done' });

                        expect(response.statusCode).to.equal(200);
                        expect(response.statusText).to.equal('Done');
                    });
                });
            });
        });

        describe('timeout filter', function () {

        });

        describe('switch filter', function () {

        });
    });
});
