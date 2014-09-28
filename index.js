'use strict';

var base     = require('kwest-base'),
    urlUtil  = require('url'),
    defaults = require('merge-defaults');


function isParsedUrl(url) {
  return url && url.protocol && (url.host || url.hostname);
}

function readUri(options) {
  if (typeof options === 'string') {
    return urlUtil.parse(options);
  } else if (typeof options.uri === 'string') {
    return urlUtil.parse(options.uri);
  } else if (isParsedUrl(options.uri)) {
    return options.uri;
  }
  return undefined;
}

function normalizeOptions(options) {
  options = options || {};
  var uri = readUri(options);
  if (typeof options === 'string') {
    options = {};
  }
  options.uri = uri;
  return options;
}


function init(defaultOptions, initial) {

  var baseKwest = initial || base();

  function kwest(options) {
    options = normalizeOptions(options);
    defaults(options, defaultOptions);
    return baseKwest(options);
  }

  function fork(newDefaultOptions) {
    if (newDefaultOptions || defaultOptions) {
      newDefaultOptions = normalizeOptions(newDefaultOptions);
      defaults(newDefaultOptions, defaultOptions || {});
    }
    return init(newDefaultOptions, baseKwest.fork());
  }

  function use(middleware) {
    baseKwest.use(middleware);
    return kwest;
  }

  function makeMethod(method) {
    return function (options) {
      options.method = method;
      return kwest(options);
    };
  }


  kwest.fork     = fork;
  kwest.use      = use;
  kwest.get      = makeMethod('GET');
  kwest.head     = makeMethod('HEAD');
  kwest.put      = makeMethod('PUT');
  kwest.post     = makeMethod('POST');
  kwest.del      = makeMethod('DELETE');
  kwest.patch    = makeMethod('PATCH');
  return kwest;

}

module.exports = init;
