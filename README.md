# demock
[![Build Status](https://travis-ci.org/demockjs/demock.png?branch=master)](https://travis-ci.org/demockjs/demock)

A library-agnostic API mocking library.

It's extremely lightweight, flexible and follows [UMD](https://github.com/umdjs/umd).


```
bower install --save-dev demock
```

Or:

```
npm install --save-dev demock
```

## The why and what

[Backend-less UI Development](https://speakerdeck.com/atesgoral/backend-less-ui-development)

## How it works

1. Hook into your application's HTTP transport to intercept requests.
2. Pass a request through demock, which in turn passes it through all the configured request filters.
3. Pass the filtered request down to the HTTP transport to make the actual HTTP request.
4. On receiving the response, pass the response along with the original request through demock, which in turn passes it through all the configured response filters.
5. Pass the fitered response up to the application.

## Usage

1. Include Demock
2. Include a transport adaptor
3. Enable some filters

Two transport adaptors are readily available:
* [jQuery](https://github.com/demockjs/demock-jquery) `bower install --save-dev demock-jquery`
* [Angular](https://github.com/demockjs/angular-demock) `bower install --save-dev angular-demock`

## API

Get a new demock instance:

```js
var demock = new Demock();
```

### Methods

#### `.addRequestFilter(filter)`

Adds a filter to the request filter chain. A filter is a function that takes in a request object:

```js
demock.appendRequestFilter(function (request) {
    // manipulate the request
});
```

#### `.addResponseFilter(filter)`

Adds a filter to the response filter chain. A filter is a function that takes in a request and a response object:

```js
demock.appendResponseFilter(function (request, response) {
    // manipulate the request and response
});
```

#### `.filterRequest(request)`

Runs all request filters on an abstract request object:

```js
demock.filterRequest(request);
```

#### `.filterResponse(request, response)`

Runs all response filters on an abstract response object. The abstract request object that's used for `.filterRequest()` is used again:

```js
demock.filterResponse(request, response);
```

### Objects

#### `request`

An abstract representation of an HTTP request. Has the following properties:

<dl>
    <dt>method</dt> <dd>The request method (uppercase): GET, POST, PUT, DELETE, etc.</dd>
    <dt>url</dt>    <dd>The request URL.</dd>
    <dt>params</dt> <dd>The request parameters. This is an object.</dd>
    <dt>headers</dt><dd>The request headers. This is an object.</dd>
</dl>

##### Example
```js
{
    method: 'GET',
    url: '/api/users',
    params: { id: 1, sortKey: 'name' },
    headers: { 'X-Custom': 'foo' }
}
```

#### `response`

An abtract representation of an HTTP response. Has the following properties:

<dl>
    <dt>statusCode</dt> <dd>The response status code: 200, 404, etc.</dd>
    <dt>statusText</dt> <dd>The response status text: 'OK', 'Not Found', etc.</dd>
    <dt>data</dt>       <dd>The response payload (Array/Object).</dd>
    <dt>headers</dt>    <dd>The response headers. This is an object.</dd>
</dl>

##### Example
```js
{
    statusCode: 200,
    statusText: 'OK',
    data: [{ name: 'John' }, { name: 'Jane' }],
    headers: { 'Content-Type': 'application/json' }
}
```

## Stock request filters

Demock comes with stock request filters as properties of the `Demock.requestFilters` object.

### method

* Changes the method of non-GET requests to GET
* Appends the original method name to the path
* Includes the original request parameters as "X-Request-*" HTTP headers

#### Example

```js
demock.appendRequestFilter(Demock.requestFilters.method());

var request = {
    method: 'POST',
    url: '/api/foo',
    params: {
        a: 1,
        b: 2
    }
};

demock.filterRequest(request);

/* request becomes:
{
    method: 'GET',
    url: '/api/foo/POST',
    params: {
        a: 1,
        b: 2
    }
    headers: {
        'X-Request-Param-a': 1,
        'X-Request-Param-b': 2
    }
}
*/
```

### defaultDocument

Appends a default document to the path. This is useful when you don't want to configure your static web server with a custom default document (i.e. something other than index.html, etc.)

The filter instance expects a configuration object with the `defaultDocument` property.

#### Example

```js
demock.appendRequestFilter(Demock.requestFilters.defaultDocument({
    defaultDocument: 'data.json'
});

var request = {
    method: 'GET',
    url: '/api/foo'
};

demock.filterRequest(request);

/* request becomes:
{
    method: 'GET',
    url: '/api/foo/data.json'
}
*/
```

## Built-in response filtering

The only response filtering that is built-in is the data replacement filter. Response filters can make use of this filter for nested application of response filters on response data.

#### Example

```js
var response = {
    data: {
        $data: {
            a: 1
        }
    }
};

demock.filterResponse(request, response);

/* response becomes:
{
    data: {
        a: 1
    }
}
*/
```

## Stock response filters

Demock comes with stock response filters as properties of the `Demock.responseFilters` object.

### delay

### status

### timeout

### switch

## Transport adaptors

A typical transport adaptor would do:


```js
// Intercept request
// ...

// Compose abstract request object from original request configuration:
var request = {
    method: httpConfig.method,
    url: httpConfig.url,
    params: httpConfig.params,
    headers: httpConfig.headers
};

// Run request filters:
demock.filterRequest(request);

// Convey changes from the abstract request to the real request configuration and perform the request:
httpConfig.method = request.method;
httpConfig.url = request.url;
httpConfig.params = request.params;
httpConfig.headers = request.headers;

// Perform request
// ...

// Compose abstract response object from original response object:
var response = {
    statusCode: httpResponse.statusCode,
    statusText: httpResponse.statusText,
    headers: httpResponse.headers,
    data: httpResponse.data
};

// Run response filters:
demock.filterResponse(request, response);

// Convey changes from the abstract response to the real response:
httpResponse.statusCode = response.statusCode;
httpResponse.statusText = response.statusText;
httpResponse.headers = response.headers;
httpResponse.data = response.data;

// Return modified response
// ...
```
