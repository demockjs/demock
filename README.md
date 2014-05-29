# demock
[![Build Status](https://travis-ci.org/atesgoral/demock.png?branch=master)](https://travis-ci.org/atesgoral/demock)

A library-agnostic API mocking library.

## The why and what

[Backend-less UI Development](https://speakerdeck.com/atesgoral/backend-less-ui-development)

## How it works

1. Hook into your application's HTTP transport to intercept requests.
2. Pass a request through demock, which in turn passes it through all the configured request filters.
3. Pass the filtered request down to the HTTP transport to make the actual HTTP request.
4. On receiving the response, pass the response along with the original request through demock, which in turn passes it through all the configured response filters.
5. Pass the fitered response up to the application.

Two transport adaptors are already available:
* adaptors/jquery.js
* adaptors/angular.js

## Examples

```
cd examples
bower install
```

Then serve the parent directory from a static web server. The serve NPM module is handy:

```
npm install -g serve
serve ..
```

## API

### Properties

#### `.filterPrefix`

#### `.config`

#### `.requestFilters`

#### `.responseFilters`

### Methods

#### `.filterRequest(request)`

#### `.filterResponse(request, response)`

### Objects

#### `request`

An HTTP request. Has the following properties:

<dl>
    <dt>method</dt> <dd>The request method (uppercase): GET, POST, PUT, DELETE, etc.</dd>
    <dt>url</dt>    <dd>The request URL.</dd>
    <dt>params</dt> <dd>The request parameters. This is an object with key/value pairs as properties.</dd>
</dl>

##### Example
```
{
    method: 'GET',
    url: '/api/users',
    params: { id: 1, sortKey: 'name' }
}
```

#### `response`

An HTTP response. Has the following properties:

<dl>
    <dt>statusCode</dt> <dd>The response status code: 200, 404, etc.</dd>
    <dt>statusText</dt> <dd>The response status text: 'OK', 'Not Found', etc.</dd>
    <dt>data</dt>       <dd>The response payload (Array/Object).</dd>
</dl>

##### Example
```
{
    statusCode: 200,
    statusText: 'OK',
    data: [{ name: 'John' }, { name: 'Jane' }]
}
```
