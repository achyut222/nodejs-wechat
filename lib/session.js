var parseString = require('xml2js').parseString;
var util = require('./util.js');
function Session(req, res, wechat) {
  this.req = req;
  this.res = res;
  this.wechat = wechat;
  this.init();
}
Session.prototype.init = function() {
  var e = new Error();
  this.incomingMessage = util.stripXmlJson(this.req.body);
}
Session.prototype.replyMessage = function(outgoingMessage) {
  outgoingMessage.FromUserName = this.incomingMessage.ToUserName;
  outgoingMessage.ToUserName = this.incomingMessage.FromUserName;
  outgoingMessage.CreateTime = Date.now();
  this.wechat.replyMessage(this, outgoingMessage);
}
Session.prototype.replyTextMessage = function(content) {
  this.replyMessage({
    MsgType: 'text',
    Content: content
  });
}
Session.prototype.replyNewsMessage = function(articles) {
  this.replyMessage({
    MsgType: 'news',
    ArticleCount: articles.length,
    Articles: articles
  });
}
module.exports = Session;
