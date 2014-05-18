var fs = require('fs');
var assert = require('assert');
var xml2js = require('xml2js');
var async = require('async');
var util = require('../lib/util.js');
var messages = require('./template.json');
var xmlParser = require('express-xml-parser');
var Wechat = require('../lib/wechat.js');

var parser = xmlParser();

describe('test Wechat and Session', function () {
  describe('#replyMessage', function () {
    it('should reply text message', function (done) {
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
  describe('#replyTextMessage', function () {
    it('should reply text message', function (done) {
      test(
        messages.text.xml,
        function(session) {
          session.replyTextMessage(messages.text.json.Content);
        },
        done);
    });
  });
  describe('#replyNewsMessage', function() {
    it('should reply news message', function (done) {
      test(
        messages.news.xml,
        function(session) {
          session.replyNewsMessage(messages.news.json.Articles);
        },
        done);
    });
  });
});

function test(outputXml, onText, cb) {
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
  var fakeres = {
    type: function() {},
    end: function() {},
    send: function(xml) {
      async.parallel({
        output: function(cb) {
          xml2js.parseString(xml, cb);
        },
        expected: function(cb) {
          xml2js.parseString(outputXml, cb);
        }
      }, function(err, data) {
        if (err) return cb(err);
        var output = data.output;
        var expected = data.expected;
        var toUserName = output.xml.ToUserName;
        output.xml.ToUserName = output.xml.FromUserName;
        output.xml.FromUserName = toUserName;
        delete output.xml.CreateTime;
        delete expected.xml.CreateTime;
        try {
          assert.deepEqual(output, expected);
        } catch(e) {
          return cb(e);
        }
        cb();
      });
    }
  };
  var wechat = new Wechat({
    token: token
  });
  wechat.on('text', onText);
  parser(fakereq, fakeres, function(err) {
    if (err) return cb(err);
    wechat.handleRequest(fakereq, fakeres);
  });
}


