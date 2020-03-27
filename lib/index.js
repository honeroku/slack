'use strict';

const slack = require('slack');

function slackAppender(config, layout) {
  let lastTimestamp = 0;

  const appender = (loggingEvent) => {
    const data = {
      token: config.token,
      channel: config.channel_id,
      text: layout(loggingEvent, config.timezoneOffset),
      icon_url: config.icon_url,
      username: config.username
    };

    lastTimestamp = new Date().getTime();
    slack.chat.postMessage(data, (err) => {
      if (err) {
        console.error('log4js:slack - Error sending log to slack: ', err); //eslint-disable-line
      }
    });
  };

  appender.shutdown = (done) => {
    const currentTimestamp = new Date().getTime();
    const waitAtleast = 1000 - (currentTimestamp - lastTimestamp);
    setTimeout(() => {
      done();
    }, Math.max(waitAtleast, 0));
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
