define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
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

        describe('#filterRequest()', function () {

            describe('with no filters', function () {

                beforeEach(function () {
                    demock = new Demock();
                });

                it('should leave the request object untouched', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test',
                        params: { a: 1 },
                        headers: { b: 1 }
                    };

                    demock.filterRequest(request);

                    expect(request.method).to.equal('GET');
                    expect(request.url).to.equal('/api/test');
                    expect(request.params).to.deep.equal({ a: 1 });
                    expect(request.headers).to.deep.equal({ b: 1 });
                });
            });
        });

        describe('#filterResponse()', function () {

            describe('with no filters', function () {

                beforeEach(function () {
                    demock = new Demock();
                });

                it('should leave the request and response objects untouched', function () {
                    var request = {
                        method: 'GET',
                        url: '/api/test',
                        params: { a: 1 },
                        headers: { b: 1 }
                    };

                    var response = {
                        statusCode: 200,
                        statusText: 'OK',
                        data: { c: 1 },
                        headers: { d: 1 }
                    };

                    demock.filterResponse(request, response);

                    expect(request.method).to.equal('GET');
                    expect(request.url).to.equal('/api/test');
                    expect(request.params).to.deep.equal({ a: 1 });
                    expect(request.headers).to.deep.equal({ b: 1 });

                    expect(response.statusCode).to.equal(200);
                    expect(response.statusText).to.equal('OK');
                    expect(response.data).to.deep.equal({ c: 1 });
                    expect(response.headers).to.deep.equal({ d: 1 });
                });
            });
        });

        describe('stock request filters', function () {

            describe('method filter', function () {

                beforeEach(function () {
                    demock = new Demock();
                    demock.appendRequestFilter(Demock.requestFilters.method());
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

                describe('with a non-GET request', function () {

                    it('should change the method to GET', function () {
                        var request = {
                            method: 'NONGET',
                            url: '/api/test'
                        };

                        demock.filterRequest(request);

                        expect(request.method).to.equal('GET');
                    });

                    it('should change include the original request parameters as X-Request-Param-* headers', function () {
                        var request = {
                            method: 'NONGET',
                            url: '/api/test',
                            params: { a: 1, b: 2 }
                        };

                        demock.filterRequest(request);

                        expect(request.headers['X-Request-Param-a']).to.equal(1);
                        expect(request.headers['X-Request-Param-b']).to.equal(2);
                    });

                    describe('with URL with no trailing /', function () {

                        it('should append the method name as subfolder to the URL path', function () {
                            var request = {
                                method: 'NONGET',
                                url: '/api/test'
                            };

                            demock.filterRequest(request);

                            expect(request.url).to.equal('/api/test/NONGET/');
                        });
                    });

                    describe('with URL with trailing /', function () {

                        it('should append the method name as subfolder to the URL path', function () {
                            var request = {
                                method: 'NONGET',
                                url: '/api/test/'
                            };

                            demock.filterRequest(request);

                            expect(request.url).to.equal('/api/test/NONGET/');
                        });
                    });
                });
            });

            describe('defaultDocument filter', function () {

                beforeEach(function () {
                    demock = new Demock();
                    demock.appendRequestFilter(Demock.requestFilters.defaultDocument({ defaultDocument: 'index.json' }));
                });

                describe('with URL with no trailing /', function () {

                    it('should append the configured default document filename to the URL path', function () {
                        var request = {
                            method: 'GET',
                            url: '/api/test'
                        };

                        demock.filterRequest(request);

                        expect(request.url).to.equal('/api/test/index.json');
                    });
                });

                describe('with URL with trailing /', function () {

                    it('should append the configured default document filename to the URL path', function () {
                        var request = {
                            method: 'GET',
                            url: '/api/test/'
                        };

                        demock.filterRequest(request);

                        expect(request.url).to.equal('/api/test/index.json');
                    });
                });
            });
        });

        describe('built-in data response filter', function () {

            it('should replace response payload', function () {
                demock = new Demock();

                var response = {
                    data: {
                        $data: { foo: 'bar' }
                    }
                };

                demock.filterResponse({}, response);

                expect(response.data).to.deep.equal({ foo: 'bar' });
            });
        });

        describe('stock response filters', function () {

            describe('delay filter', function () {

                beforeEach(function () {
                    demock = new Demock();
                    demock.appendResponseFilter(Demock.responseFilters.delay());
                });

                describe('with delay property in response payload', function () {

                    it('should set the delay property of the response object', function () {
                        var response = {
                            data: {
                                $delay: 250
                            }
                        };

                        demock.filterResponse({}, response);

                        expect(response.delay).to.equal(250);
                    });
                });
            });

            describe('status filter', function () {

                beforeEach(function () {
                    demock = new Demock();
                    demock.appendResponseFilter(Demock.responseFilters.status());
                });

                describe('with status property in response payload', function () {

                    describe('the code property', function () {

                        it('should override the HTTP response status code', function () {
                            var response = {
                                statusCode: 200,
                                statusText: 'OK',
                                data: {
                                    $status: {
                                        code: 400
                                    }
                                }
                            };

                            demock.filterResponse({}, response);

                            expect(response.statusCode).to.equal(400);
                            expect(response.statusText).to.equal('OK');
                        });
                    });

                    describe('the text property', function () {

                        it('should override the HTTP response status text', function () {
                            var response = {
                                statusCode: 200,
                                statusText: 'OK',
                                data: {
                                    $status: {
                                        text: 'Done'
                                    }
                                }
                            };

                            demock.filterResponse({}, response);

                            expect(response.statusCode).to.equal(200);
                            expect(response.statusText).to.equal('Done');
                        });
                    });
                });
            });

            describe('timeout filter', function () {

                beforeEach(function () {
                    demock = new Demock();
                    demock.appendResponseFilter(Demock.responseFilters.timeout());
                });

                describe('with timeout property in response payload', function () {

                    it('should set the timeout property of the response object', function () {
                        var response = {
                            data: {
                                $timeout: true
                            }
                        };

                        demock.filterResponse({}, response);

                        expect(response.timeout).to.be.true;
                    });
                });
            });

            describe('switch filter', function () {

                beforeEach(function () {
                    demock = new Demock();
                    demock.appendResponseFilter(Demock.responseFilters.switch());
                });

                describe('with switch property in response payload', function () {

                    describe('with request parameter value matching a case', function () {

                        it('should change the response payload to the matching case', function () {
                            var response = {
                                data: {
                                    // @todo or maybe cases should be nested inside switch value
                                    $switch: 'username',
                                    $case: {
                                        joe: {
                                            name: 'Joe'
                                        }
                                    }
                                }
                            };

                            demock.filterResponse({
                                params: {
                                    username: 'joe'
                                }
                            }, response);

                            expect(response.data.name).to.equal('Joe');
                        });
                    });


                    describe('with request parameter value not matching any case', function () {

                        it('should change the response payload to the default case', function () {
                            var response = {
                                data: {
                                    // @todo or maybe cases should be nested inside switch value
                                    $switch: 'username',
                                    $case: {
                                        joe: {
                                            name: 'Joe'
                                        }
                                    },
                                    $default: {
                                        name: 'Unknown'
                                    }
                                }
                            };

                            demock.filterResponse({
                                params: {
                                    username: 'jane'
                                }
                            }, response);

                            expect(response.data.name).to.equal('Unknown');
                        });
                    });

                    describe('with request parameter value not matching any case while a default case is absent', function () {

                        it('should set response payload to undefined', function () {
                            var response = {
                                data: {
                                    // @todo or maybe cases should be nested inside switch value
                                    $switch: 'username',
                                    $case: {
                                        joe: {
                                            name: 'Joe'
                                        }
                                    }
                                }
                            };

                            demock.filterResponse({
                                params: {
                                    username: 'jane'
                                }
                            }, response);

                            expect(response.data).to.be.undefined;
                        });
                    });
                });
            });
        });

        describe('filter interface', function () {

            describe('request filters', function () {

                describe('when multiple enabled', function () {

                    beforeEach(function () {
                        demock = new Demock();

                        demock
                            .appendRequestFilter(function (request) {
                                request.url += 'a';
                            })
                            .appendRequestFilter(function (request) {
                                request.url += 'b';
                            });
                    });

                    it('should apply all filters in order', function () {
                        var request = {
                            url: ''
                        };

                        demock.filterRequest(request);

                        expect(request.url).to.equal('ab');
                    });
                });
            });

            describe('response filters', function () {

                describe('when multiple enabled', function () {

                    beforeEach(function () {
                        demock = new Demock();

                        demock
                            .appendResponseFilter(function (request, response) {
                                response.statusText += 'a';
                            })
                            .appendResponseFilter(function (request, response) {
                                response.statusText += 'b';
                            });
                    });

                    it('should apply all filters in order', function () {
                        var response = {
                            statusText: ''
                        };

                        demock.filterResponse({}, response);

                        expect(response.statusText).to.equal('ab');
                    });
                });

                describe('data modifiers', function () {

                    beforeEach(function () {
                        demock = new Demock();

                        demock
                            .appendResponseFilter(function (request, response) {
                                response.statusText += 'a';
                            })
                            .appendResponseFilter(function (request, response) {
                                response.statusText += 'b';
                            });
                    });

                    it('should rerun all filters as long as data is modified', function () {
                        var response = {
                            data: {
                                $data: {
                                    $data: {}
                                }
                            },
                            statusText: ''
                        };

                        demock.filterResponse({}, response);

                        expect(response.statusText).to.equal('ababab');
                    });
                });
            });
        });
    });
});
