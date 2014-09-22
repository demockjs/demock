define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'node_modules/sinon/lib/sinon',
    'node_modules/sinon-chai/lib/sinon-chai',
    'demock'
], function (bdd, chai, expect, sinon, sinonChai, Demock) {
    'use strict';

    chai.use(sinonChai);

    var describe = bdd.describe,
        before = bdd.before,
        after = bdd.after,
        beforeEach = bdd.before,
        afterEach = bdd.after,
        it = bdd.it;

    describe('Demock', function () {
        var demock;

        beforeEach(function () {
            demock = new Demock();
        });

        describe('#config', function () {

            it('should be an object', function () {
                expect(demock.config).to.be.an('object');
            });

            describe('filterPrefix', function () {

                it('should be set to $ by default', function () {
                    expect(demock.config.filterPrefix).to.equal('$');
                });
            });
        });

        describe('#filterRequest()', function () {

            describe('with no filters', function () {

                it('should leave the request object untouched', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test',
                        params: { a: 1 }
                    };

                    demock.filterRequest(request);

                    expect(request.method).to.equal('GET');
                    expect(request.url).to.equal('/api/test');
                    expect(request.params).to.deep.equal({ a: 1 });
                });
            });

            describe('with a filter', function () {

                it('should ignore the filter if the filter does not have a filterRequest method', function () {
                    demock.use({});

                    var request = {
                        method: 'GET',
                        url: '/api/test',
                        params: { a: 1 }
                    };

                    demock.filterRequest(request);

                    expect(request.method).to.equal('GET');
                    expect(request.url).to.equal('/api/test');
                    expect(request.params).to.deep.equal({ a: 1 });
                });

                it('should pass the request object to the filterRequest method of the filter', function () {
                    var filter = {
                        filterRequest: sinon.spy()
                    };

                    demock.use(filter);

                    var request = {
                        method: 'GET',
                        url: '/api/test',
                        params: { a: 1 }
                    };

                    demock.filterRequest(request);

                    expect(filter.filterRequest).to.have.been.calledWith(request);
                });
            });
        });

        describe('#filterResponse()', function () {

            describe('with no filters', function () {

                it('should leave the response object untouched', function () {
                    var response = {
                        statusCode: 200,
                        statusText: 'OK',
                        data: { a: 1 }
                    };

                    demock.filterResponse({}, response);

                    expect(response.statusCode).to.equal(200);
                    expect(response.statusText).to.equal('OK');
                    expect(response.data).to.deep.equal({ a: 1 });
                });
            });
        });

        describe('stock request filters', function () {

            describe('method filter', function () {

                beforeEach(function () {
                    demock.use(demock.method());
                });

                describe('with a GET request', function () {

                    it('should leave the method and the URL untouched', function () {
                        var request = {
                            method: 'GET',
                            url: '/api/test'
                        };

                        demock.filterRequest(request);

                        expect(request.method).to.equal('GET');
                        expect(request.url).to.equal('/api/test');
                    });
                });
            });
        });

    //         describe('with a non-GET request', function () {

    //             it('should change the method to GET', function () {
    //                 var request = {
    //                     method: 'NONGET',
    //                     url: '/api/test'
    //                 };

    //                 demock.requestFilters.method(request);

    //                 expect(request.method).to.equal('GET');
    //             });

    //             describe('with URL with no trailing /', function () {

    //                 it('should append the method name as subfolder to the URL path', function () {
    //                     var request = {
    //                         method: 'NONGET',
    //                         url: '/api/test'
    //                     };

    //                     demock.requestFilters.method(request);

    //                     expect(request.url).to.equal('/api/test/NONGET/');
    //                 });
    //             });

    //             describe('with URL with trailing /', function () {

    //                 it('should append the method name as subfolder to the URL path', function () {
    //                     var request = {
    //                         method: 'NONGET',
    //                         url: '/api/test/'
    //                     };

    //                     demock.requestFilters.method(request);

    //                     expect(request.url).to.equal('/api/test/NONGET/');
    //                 });
    //             });
    //         });
    //     });

    //     describe('defaultDocument filter', function () {
    //         beforeEach(function () {
    //             demock.config.defaultDocument = 'index.json';
    //         });

    //         afterEach(function () {
    //             demock.config.defaultDocument = '';
    //         });

    //         describe('with URL with no trailing /', function () {

    //             it('should append the configured default document filename to the URL path', function () {
    //                 var request = {
    //                     method: 'GET',
    //                     url: '/api/test'
    //                 };

    //                 demock.requestFilters.defaultDocument(request);

    //                 expect(request.url).to.equal('/api/test/index.json');
    //             });
    //         });

    //         describe('with URL with trailing /', function () {

    //             it('should append the configured default document filename to the URL path', function () {
    //                 var request = {
    //                     method: 'GET',
    //                     url: '/api/test/'
    //                 };

    //                 demock.requestFilters.defaultDocument(request);

    //                 expect(request.url).to.equal('/api/test/index.json');
    //             });
    //         });
    //     });
    });

    // describe('stock response filters', function () {

    //     describe('data filter', function () {

    //         it('should replace the response payload with the argument', function () {
    //             var replacement = {};

    //             var response = {
    //                 data: {}
    //             };

    //             demock.responseFilters.data({}, response, replacement);

    //             expect(response.data).to.equal(replacement);
    //         });
    //     });

    //     describe('delay filter', function () {

    //     });

    //     describe('status filter', function () {

    //         describe('when argument is an object', function () {

    //             describe('the code property', function () {

    //                 it('should override the HTTP response status code', function () {

    //                     var response = {
    //                         statusCode: 200,
    //                         statusText: 'OK'
    //                     };

    //                     demock.responseFilters.status({}, response, { code: 400 });

    //                     expect(response.statusCode).to.equal(400);
    //                     expect(response.statusText).to.equal('OK');
    //                 });
    //             });

    //             describe('the text property', function () {

    //                 it('should override the HTTP response status text', function () {

    //                     var response = {
    //                         statusCode: 200,
    //                         statusText: 'OK'
    //                     };

    //                     demock.responseFilters.status({}, response, { text: 'Done' });

    //                     expect(response.statusCode).to.equal(200);
    //                     expect(response.statusText).to.equal('Done');
    //                 });
    //             });
    //         });
    //     });

    //     describe('timeout filter', function () {

    //     });

    //     describe('switch filter', function () {

    //     });
    // });
});
