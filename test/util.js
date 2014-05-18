var assert = require('assert');
var xml2js = require('xml2js');

var util = require('../lib/util.js');
var messages = require('./template.json');


describe('util', function () {
  describe('#sha1', function () {
    it('should calculate shasum', function () {
      assert.ok(util.sha1('test') === 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
        'shasum of test is wrong');
    });
  });
  describe('#stripXmlJson', function () {
    it('should strip xml-json to json', function (done) {
      var msg = messages.text;
      xml2js.parseString(msg.xml, function(err, json) {
        json = util.stripXmlJson(json);
        assert.deepEqual(json, msg.json, 'not equal');
        done();
      });
    });
  });
  describe('#signature', function() {
    it('should signature the data', function() {
      assert.equal(util.signature(['b', 'a', 'c']),
        util.signature(['b', 'c', 'a']));
    })
  });
});
