var kwest   = require('..'),
    express = require('express'),
    assert  = require('chai').assert;

describe('kwest', function () {

  var server;

  afterEach(function (done) {
    server.close(done);
  });



  it('makes simple request', function (done) {

    server = express()
      .get('/', function (req, res) {
        res.send('hello');
      })
      .listen(3000, function () {

        kwest.get('http://localhost:3000')
          .then(function (res) {
            assert.propertyVal(res, 'statusCode', 200);
            assert.propertyVal(res, 'body', 'hello');
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

        kwest.defaults({
          headers: {
            'x-test': 'hello'
          }
        }).get('http://localhost:3000')
          .then(function (res) {
            assert.propertyVal(res, 'statusCode', 200);
            assert.propertyVal(res, 'body', 'hello');
            done();
          })
          .catch(done);

      });

  });

  it('wraps a middleware', function (done) {

    server = express()
      .get('/', function (req, res) {
        res.send(req.headers['x-test']);
      })
      .listen(3000, function () {

        kwest.wrap(function (makeRequest, options) {
          assert.deepPropertyVal(options, 'uri.href', 'http://localhost:3000/');
          assert.property(options, 'headers');
          options.headers['x-test'] = 'hello';
          return makeRequest(options)
            .then(function (res) {
              res.body += ' world';
              return res;
            });
        }).get('http://localhost:3000')
          .then(function (res) {
            assert.propertyVal(res, 'statusCode', 200);
            assert.propertyVal(res, 'body', 'hello world');
            done();
          })
          .catch(done);

      });

  });

});
