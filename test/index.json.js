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

        describe('method', function () {

            describe('with a GET request', function () {

                it('should leave the method and the URL untouched', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test'
                    };

                    indexJson.requestFilters.method(request);

                    expect(request.method).to.be.equal('GET');
                    expect(request.url).to.be.equal('/api/test');
                });
            });

            describe('with a non-GET request', function () {

                it('should change the method to GET', function () {
                    var request = {
                        method: 'NONGET',
                        url: '/api/test'
                    };

                    indexJson.requestFilters.method(request);

                    expect(request.method).to.be.equal('GET');
                });

                describe('with URL with no trailing /', function () {

                    it('should append the method name as subfolder to the URL path', function () {
                        var request = {
                            method: 'NONGET',
                            url: '/api/test'
                        };

                        indexJson.requestFilters.method(request);

                        expect(request.url).to.be.equal('/api/test/NONGET');
                    });
                });

                describe('with URL with trailing /', function () {

                    it('should append the method name as subfolder to the URL path', function () {
                        var request = {
                            method: 'NONGET',
                            url: '/api/test/'
                        };

                        indexJson.requestFilters.method(request);

                        expect(request.url).to.be.equal('/api/test/NONGET');
                    });
                });
            });
        });

        describe('defaultDocument', function () {

            describe('with URL with no trailing /', function () {

                it('should append the configured default document filename to the URL path', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test'
                    };

                    indexJson.requestFilters.defaultDocument(request);

                    expect(request.url).to.be.equal('/api/test/index.json');
                });
            });

            describe('with URL with trailing /', function () {

                it('should append the configured default document filename to the URL path', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test/'
                    };

                    indexJson.requestFilters.defaultDocument(request);

                    expect(request.url).to.be.equal('/api/test/index.json');
                });
            });
        });
    });

    // describe('default response filters', function () {

    //     describe('delay', function () {

    //     });

    //     describe('status', function () {

    //     });

    //     describe('timeout', function () {

    //     });

    //     describe('switch', function () {

    //     });
    // });
});
