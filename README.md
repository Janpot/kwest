# kwest

Replacement for the excelent request library. aims to be more modular and extensible.

## Installation

    $ npm install --save kwest

## Disclaimer

This is a prototype and for now it passes all options straight through `request`.
This is done so I can immediately use this module in production and get a feel for the usefulness of the API.
Consequence is that over time these options will disappear and be put in separate modules.

## API

Rougly the same API as original request library (for now). With the addition of a `.wrap` method which is used to extend the functionality.
kwest aims to provide a simple core and have higher level modules handle functionality such as redirection, gzip, authentication, caching...

The most simple example is the following middleware, which is basically just the identity
```js
kwest = kwest.wrap(function (makeRequest, options) {
  return makeRequest(options);
});

kwest.get(url)
  .then(function (res) {
    // response is exactly the same as without the wrapped middleware
  })
```

You can make kwest reject its result when the server responds with a bad statuscode.
```js
kwest = kwest.wrap(function rejectBadStatus(makeRequest, options) {
  return makeRequest(options)
    .then(function (res) {
      if (res.statusCode !== 200) throw new Error('Bad status');
    });
});

kwest.get(url)
  .catch(function (err) {
    // this promise will be rejected when server returns a bad statuscode
  })
```

or you can augment functionality
```js
kwest = kwest.wrap(function rejectBadStatus(makeRequest, options) {
  options.headers['accept-encoding'] = 'gzip';
  return makeRequest(options);
});

kwest.get(url)
  .then(function (res) {
    // Can have gzipped responses now
  })
```
