# kwest [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

express for client side requests. Uses a middleware-like strategy to build up a http request method tailored to your specific needs.

## Installation

    $ npm install --save kwest

## Disclaimer

This is just a prototype, use at your own risk!

## Use

Rougly the same API as the request library (for now). Kwest uses promises instead of callbacks though. With the addition of a `.use()` method kwest can be extended with middleware.
kwest aims to provide a simple core and have higher level modules handle functionality such as redirection, gzip, authentication, caching...

The most simple example is the following middleware, which is basically just the identity.
```js
var kwest = require('kwest');
var request = kwest();
request.use(function (req, next) {
  return next(req);
});

request(url)
  .then(function (res) {
    // response is exactly the same as without the middleware
  })
```

Example: You can make kwest reject its result when the server responds with a bad statuscode. This functionality is actually provided in the [kwest-handle-error](https://github.com/Janpot/kwest-handle-error) module.
```js
var request = kwest();
request.use(function rejectBadStatus(req, next) {
  return next(req)
    .then(function (res) {
      if (res.statusCode !== 200) throw new Error('Bad status');
      return res;
    });
});

request(url)
  .catch(function (err) {
    // this promise will be rejected when the server returns a bad statuscode
  })
```

Or you can augment functionality. This example is actually provided in the [kwest-gzip](https://github.com/Janpot/kwest-gzip) module
```js
var request = kwest();
request.use(function rejectBadStatus(req, next) {
  req.setHeader('accept-encoding', 'gzip');
  return next(req)
    .then(function (res) {
      // handle gzip ...
      return unzipped;
    });
});

request(url)
  .then(function (res) {
    // Can have gzipped responses now
  })
```

## API

### var request = kwest([function])

Creates a request function that can make the most basic http requests. Optionally an argument can be provided that represents the last request in the middleware chain. This is useful for e.g. mocking, browserify,...
`request` can be called either with a string or with an options object to make the actual request. available options are:
- `uri`: string or parsed url. This is mandatory
- `method`: cdefaults to `GET`
- `headers`: headers for this request
- ... whatever extra options you want to pass down to middleware

### request.use(middleware)

Adds a middleware to the chain. This is a function of the form

```js
function (request, next) {
  return next(request);
}
```

request contains all request parameters and is intended to be modified by middleware. It always has following properties:
- `uri`: this is a parsed url object with the current url.
- `method`: current http method for this request
- `headers`: map of the headers for this request
- `setHeader`, `getHeader`, `hasHeader`, `removeHeader`: Utility methods provided by `caseless.httpify`.

The middleware function is expected to return a promise with a response object. `next` can be called with `request` as parameter to receive promise of the response provided kwest. This response is passed on to the next middleware and can be transformed as you wish.

### request.fork()

returns a new instance based on the current one that can be used to add extra middleware.

### request.get

Convenience function. Defaults to method `GET`.

### request.post
### request.put
### request.del
### request.head
### request.patch
...


[travis-url]: http://travis-ci.org/Janpot/kwest
[travis-image]: http://img.shields.io/travis/Janpot/kwest.svg?style=flat

[depstat-url]: https://david-dm.org/Janpot/kwest
[depstat-image]: http://img.shields.io/david/Janpot/kwest.svg?style=flat
