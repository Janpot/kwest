'use strict';

var Promise  = require('bluebird'),
    _request = require('request'),
    urlUtil  = require('fast-url-parser'),
    extend   = require('extend');

function merge(obj1, obj2) {
  // the resulting object will have all (deep) properties of obj1 and obj2
  // obj2 has precendence over obj1
  return extend(true, {}, obj1, obj2);
}

function isParsedUrl(url) {
  return url.protocol && (url.host || url.hostname);
}

function normalizeOptions(options) {
  if (typeof options === 'string') {
    options = {
      uri: urlUtil.parse(options)
    };
  } else if (typeof options.uri === 'string') {
    options.uri = urlUtil.parse(options.uri);
  }

  options.headers = options.headers || {};
  options.encoding = 'binary';

  return options;
}


var jar    = _request.jar.bind(_request),
    cookie = _request.cookie.bind(_request);


function init(makeRequest) {

  function request(options) {
    var optionsObj = normalizeOptions(options);
    return makeRequest(optionsObj);
  }

  function makeMethod(method) {
    var methodOptions = { method: method };
    return function (options) {
      var optionsObj     = normalizeOptions(options),
          requestOptions = merge(methodOptions, optionsObj);
      return request(requestOptions);
    };
  }

  function wrap(middleware) {
    var newMakeRequest = function (options) {
      return middleware(makeRequest, options);
    };
    return init(newMakeRequest);
  }

  function makeDefaults(defaults) {
    return wrap(function (makeRequest, options) {
      var defaultedOptions = merge(defaults, options);
      return makeRequest(defaultedOptions);
    });
  }


  request.get      = makeMethod('GET');
  request.head     = makeMethod('HEAD');
  request.put      = makeMethod('PUT');
  request.post     = makeMethod('POST');
  request.del      = makeMethod('DELETE');
  request.patch    = makeMethod('PATCH');
  request.wrap     = wrap;
  request.jar      = jar;
  request.cookie   = cookie;
  request.defaults = makeDefaults;

  return request;

}

var promisifiedRequest = Promise.promisify(_request);

var makeRequest = function (options) {
  return promisifiedRequest(options)
    .spread(function (response) {
      return response;
    });
};

module.exports = init(makeRequest);
