index.json
==========
[![Build Status](https://travis-ci.org/atesgoral/index.json.png?branch=master)](https://travis-ci.org/atesgoral/index.json)

API
---

### Properties

#### `.filterPrefix`

#### `.defaultDocument`

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
