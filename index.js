'use strict';

var base     = require('kwest-base'),
    defaults = require('merge-defaults');

function init(initial) {

  var baseKwest = base(initial);

  function kwest(request) {
    return baseKwest(request);
  }

  function fork() {
    return init(baseKwest);
  }

  function use(middleware) {
    baseKwest.use(middleware);
    return kwest;
  }

  function makeMethod(method) {
    return function (options) {
      options.method = method;
      return baseKwest(options);
    };
  }

  function makeDefaults(defaultRequest) {
    return fork().use(function (request, next) {
      defaults(request, defaultRequest);
      return next(request);
    });
  }

  kwest.defaults = makeDefaults;
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
