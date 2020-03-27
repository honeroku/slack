'use strict';

const slack = require('slack');

function slackAppender(config, layout) {
  let requestCount = 0;

  const appender = (loggingEvent) => {
    const data = {
      token: config.token,
      channel: config.channel_id,
      text: layout(loggingEvent, config.timezoneOffset),
      icon_url: config.icon_url,
      username: config.username
    };

    requestCount += 1;
    slack.chat.postMessage(data, (err) => {
      requestCount -= 1;
      if (err) {
        console.error('log4js:slack - Error sending log to slack: ', err); //eslint-disable-line
      }
    });
  };

  appender.shutdown = (done) => {
    let retry = 1;
    const interval = setInterval(() => {
      if (requestCount === 0) {
        clearInterval(interval);
        done();
      } else if (retry >= 10) {
        clearInterval(interval);
        done(new Error('Some request is not finished'));
      } else {
        retry += 1;
      }
    }, 100);
  };

  return appender;
}

function configure(config, layouts) {
  let layout = layouts.basicLayout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  return slackAppender(config, layout);
}

module.exports.configure = configure;
