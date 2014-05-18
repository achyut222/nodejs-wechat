var fs = require('fs');
var assert = require('assert');
var xml2js = require('xml2js');
var async = require('async');
var util = require('../lib/util.js');
var messages = require('./template.json');
var xmlParser = require('express-xml-parser');
var Wechat = require('../lib/wechat.js');

var parser = xmlParser();

describe('test Wechat and Session', function() {
  describe('#replyMessage', function() {
    it('should reply text message', function(done) {
      test(
        messages.text.xml,
        function(session) {
          session.replyMessage({
            MsgType: 'text',
            Content: messages.text.json.Content
          });
        },
        done);
    });
  });
  describe('#replyTextMessage', function() {
    it('should reply text message', function(done) {
      test(
        messages.text.xml,
        function(session) {
          session.replyTextMessage(messages.text.json.Content);
        },
        done);
    });
  });
  describe('#replyNewsMessage', function() {
    it('should reply news message', function(done) {
      test(
        messages.news.xml,
        function(session) {
          session.replyNewsMessage(messages.news.json.Articles);
        },
        done);
    });
  });
  describe('error cases', function() {
    it('should return status 400 if request signature is not correct', function(done) {
      var _signature = util.signature;
      util.signature = function() {
        return Math.random().toString();
      }
      test(
        400,
        function(session) {
          session.res.end();
        },
        function(e) {
          util.signature = _signature;
          done(e);
        });
    });
    it('should return 500 if body is not set', function(done) {
      var _parser = parser;
      parser = function(req, res, next) {
        next();
      }
      test(
        500, 
        function(session) {
          session.res.end();
        }, 
        done);
    })
  });
});

function test(expected, handler, done) {
  var fakereqFilePath = __dirname + '/wechat.request.xml';
  var buf = fs.readFileSync(fakereqFilePath);
  var fakereq = fs.createReadStream(fakereqFilePath);
  fakereq.headers = {
    'content-length': buf.length,
    'content-type': 'application/xml'
  };

  var ts = Date.now();
  var token = 'bessie'
  var nonce = 900112;
  var echostr = 'love';

  fakereq.query = {
    timestamp: ts,
    nonce: nonce,
    echostr: echostr
  };
  fakereq.query.signature = util.signature(token, nonce, ts);
  var output = '';
  var fakeres = {
    statusCode: 200,
    setHeader: function() {},
    end: function() {
      if (fakeres.statusCode !== 200) {
        if (fakeres.statusCode !== expected) {
          done(new Error('status code is not equal to expected'));
          return;
        }
        done();
      } else {
        compare(output, expected, done);
      }
    },
    write: function(xml) {
      output += xml;
    }
  };
  var wechat = new Wechat({
    token: token
  });
  wechat.on('text', handler);
  wechat.on('error', function() {});
  parser(fakereq, fakeres, function(err) {
    if (err) return cb(err);
    wechat.handleRequest(fakereq, fakeres);
  });
}

function compare(output, expected, done) {
  async.parallel({
    _output: function(cb) {
      xml2js.parseString(output, cb);
    },
    _expected: function(cb) {
      xml2js.parseString(expected, cb);
    }
  }, function(err, data) {
    if (err) return done(err);

    var expected = data._expected.xml;
    var output = data._output.xml;

    // swap ToUserName and FromUserName
    var toUserName = expected.ToUserName;
    expected.ToUserName = expected.FromUserName;
    expected.FromUserName = toUserName;

    // do not compare CreateTime
    delete expected.CreateTime;
    delete output.CreateTime;

    try {
      assert.deepEqual(expected, output);
    } catch (e) {
      return done(new Error('output xml is not equal to expected xml'));
    }

    done();
  });
}