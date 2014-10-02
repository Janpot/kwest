var Promise  = require('bluebird'),
    http     = require('http'),
    caseless = require('caseless'),
    https    = require('https');



function kwestifyResponse(response) {
  caseless.httpify(response, response.headers || {});
  response.data = response;
  return response;
}

var defaultMakeRequest = function (request) {
  var protocol = {
    'http:' : http,
    'https:': https
  }[request.protocol];

  request.setHeader('host', request.hostname);

  var req;

  var responsePromise = new Promise(function (resolve, reject) {
    req = protocol.request(request)
      .on('response', resolve)
      .on('error', reject);

    if (request.data) {
      request.data
        .on('error', reject)
        .pipe(req)
        .on('error', reject);
      request.data.resume();
    } else {
      req.end();
    }
  })
    .then(kwestifyResponse)
    .cancellable()
    .catch(Promise.CancellationError, function (err) {
      req.abort();
      throw(err);
    });

  
  return responsePromise;
};


module.exports = defaultMakeRequest;
