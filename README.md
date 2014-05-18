# Nodejs Wechat

  [![NPM version](https://badge.fury.io/js/nodejs-wechat.png)](http://badge.fury.io/js/nodejs-wechat) [![Build Status](https://travis-ci.org/idy/nodejs-wechat.svg?branch=master)](https://travis-ci.org/idy/nodejs-wechat)

Nodejs wrapper of wechat api

### Usage
```javascript
var Wechat = require('nodejs-wechat');
var opt = {
  token: token,
  url: '/weixin'
};
var wechatInstance = new Wechat(opt);

var express = require('express');
var middlewares = require('express-middlewares-js');
var app = express();

app.use('/weixin', Wechat.bodyParser());
// alternative method
// app.use('/weixin', middlewares.xmlBodyParser());

app.get('/weixin', wechatInstance.verifyRequest.bind(wechatInstance));
app.post('/weixin', wechatInstance.handleRequest.bind(wechatInstance));

// you can work with other restful logics
app.use('/api', middlewares.bodyParser());

wechat.on('text', function(session) {
  session.replyTextMsg('Hello World');
});
wechat.on('image', function(session) {
  session.replyNewsMsg([{
    Title: '新鲜事',
    Description: '点击查看今天的新鲜事',
    PicUrl: 'http://..',
    Url: 'http://..'
  }]);
});
wechat.on('voice', function(session) {
  session.replyMsg({
    Title: 'This is Music',
    MsgType: 'music',
    Description: 'Listen to this music and guess ths singer',
    MusicUrl: 'http://..',
    HQMusicUrl: 'http://..',
    ThumbMediaId: '..'
  });
});
```

### Api
#### Wechat
- `#verifyRequest(req, res)`
  > This is a express/connect middleware, which verify the signature of
  request from weixin server

- `#handleRequest(req, res)`
  > This is a express/connect middleware, which handle the request post from 
  weixin server

- `#on(msgType, handler)`
  > Wechat is an inheritance from event.EventEmitter. Wechat will emit an event
  in incoming message's `MsgType`, with a `Session` as parameter. Valid events: 
  >
  > `text`, `image`, `voice`, `video`, `location`, `link`, `event.subscribe`, 
  `event.unsubscribe`, `event.SCAN`, `event.LOCATION`, `event.CLICK`, `event.VIEW`.
  >
  > __References__: [接收普通消息](http://mp.weixin.qq.com/wiki/index.php?title=%E6%8E%A5%E6%94%B6%E6%99%AE%E9%80%9A%E6%B6%88%E6%81%AF "接收普通消息"), 
  [接收事件推送](http://mp.weixin.qq.com/wiki/index.php?title=%E6%8E%A5%E6%94%B6%E4%BA%8B%E4%BB%B6%E6%8E%A8%E9%80%81 "接收事件推送")

#### Session
- `req` 
  > This is the request from weixin server

- `res`
  > This is the response to weixin server

- `#replyMsg(msgObject)`
  > Reply a message via `this.res`

- `#replyTextMessage(content)`
  > Reply a text message

- `#replyNewsMessage(articles)`
  > Reply a news messages.

### TODO
- Advanced interfaces
