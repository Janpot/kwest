var Promise = require('bluebird'),
    kwest   = require('..'),
    express = require('express'),
    assert  = require('chai').assert;

describe('kwest', function () {

  var server;

  afterEach(function (done) {
    server.close(done);
  });


  function getBody(stream) {
    return new Promise(function (resolve, reject) {
      var body = '';
      stream.on('data', function (chunk) {
        body += chunk.toString();
      });
      stream.on('error', reject);
      stream.on('end', function () {
        resolve(body);
      });
    });
  }


  it('makes simple request', function (done) {

    server = express()
      .get('/', function (req, res) {
        res.send('hello');
      })
      .listen(3000, function () {

        kwest()
          .get('http://localhost:3000')
          .then(function (res) {
            assert.propertyVal(res, 'statusCode', 200);
            return getBody(res.data);
          })
          .then(function (body) {
            assert.strictEqual(body, 'hello');
            done();
          })
          .catch(done);

      });

  });

  it('uses default headers', function (done) {

    server = express()
      .get('/', function (req, res) {
        res.send(req.headers['x-test']);
      })
      .listen(3000, function () {

        kwest({
          headers: {
            'x-test': 'hello'
          }
        })
          .get('http://localhost:3000')
          .then(function (res) {
            assert.propertyVal(res, 'statusCode', 200);
            return getBody(res.data);
          })
          .then(function (body) {
            assert.strictEqual(body, 'hello');
            done();
          })
          .catch(done);

      });

  });

  it('should use a middleware', function (done) {

    server = express()
      .get('/', function (req, res) {
        res.send(req.headers['x-test']);
      })
      .listen(3000, function () {

        kwest()
          .use(function (request, next) {
            assert.deepPropertyVal(request, 'uri.href', 'http://localhost:3000/');
            assert.property(request, 'headers');
            request.setHeader('x-test', 'hello');
            return next(request)
              .then(function (res) {
                res.setHeader('x-test-2', 'world');
                return res;
              });
          })
          .get('http://localhost:3000')
          .then(function (res) {
            assert.propertyVal(res, 'statusCode', 200);
            assert.strictEqual(res.getHeader('x-test-2'), 'world');
            return getBody(res.data);
          })
          .then(function (body) {
            assert.strictEqual(body, 'hello');
            done();
          })
          .catch(done);

      });

  });

});
