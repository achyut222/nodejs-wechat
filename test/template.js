var assert = require('assert');
var xmlTemplates = require('../lib/xml-templates.js');
var messages = require('./template.json');

describe('test xmlTemplates', function () {
  describe('#apply', function() {
    Object.keys(messages).forEach(function(msgType) {
      it('should output correct xml for ' + msgType + ' messages', function () {
        var testData = messages[msgType];
        var templ = xmlTemplates.get(msgType);
        assert.ok(templ.apply(testData.json) === testData.xml, 'output xml is not expected');  
      });
    });  
  })
});
