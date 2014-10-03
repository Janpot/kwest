'use strict';

var kwestBase = require('./kwest-base'),
    urlUtil   = require('url'),
    caseless  = require('caseless'),
    extend    = require('extend'),
    defaults  = require('merge-defaults');



function Request(options) {
  this._isKwest = true;
  this.protocol = null;
  this.hostname = null;
  this.port     = null;
  this.path     = null;
  this.headers  = {};
  caseless.httpify(this, this.headers);

  if (typeof options === 'string') {
    this.setUrl(options);
  } else {
    this.applyConfig(options);
  }
}



Request.prototype.applyConfig = function applyConfig(options) {
  if (!options) return;

  if (typeof options === 'string') {
    this.setUrl(options);
    return;
  }

  var url = options.url || options.uri;

  if (url) {
    this.setUrl(url);
  }

  Object.keys(options)
    .forEach(function (key) {
      var ignore = key === 'url' || key === 'uri';
      if (ignore) return;
      var value = options[key];
      this[key] = value;
    }.bind(this));
};

Request.prototype.setUrl = function setUrl(url) {
  var parsed;
  if (typeof url === 'string') parsed = urlUtil.parse(url);
  else parsed = url;

  this.protocol = parsed.protocol;
  this.hostname = parsed.hostname;
  this.port = parsed.port;
  this.path = parsed.path;
};

Request.prototype.getUrl = function getUrl() {
  var base = urlUtil.format({
    protocol: this.protocol,
    hostname: this.hostname,
    port: this.port
  });
  if (this.path) return base + this.path;
  else return base;
};


function buildRequest(options, defaultOptions) {
  var request;
  if (options._isKwest) {
    request = options;
  } else {
    request = new Request(options);
  }
  request.applyConfig(defaultOptions);
  return request;
}


function init(defaultOptions, initial) {

  var base = initial || kwestBase;

  function kwest(options) {
    var request = buildRequest(options, defaultOptions);
    return base(request);
  }

  function fork(withDefaults) {
    var newDefaults = extend(true, {}, defaultOptions, withDefaults);
    return init(newDefaults, base);
  }

  function use(middleware) {
    var oldBase = base;
    base = function (request) {
      return middleware(request, oldBase);
    };
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
