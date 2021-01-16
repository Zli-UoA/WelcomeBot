import { App } from '@slack/bolt';
import * as Env from 'dotenv';
import * as fs from 'fs';

if (process.env.NODE_ENV === 'dev') Env.config();

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const postChannelID = process.env.POST_CHANNEL_ID;
const messageTemplateFile = process.env.MESSAGE_TEMPLATE_FILE;
const messageTemplate = fs.readFileSync(messageTemplateFile, "utf-8");
const emojiNoticeChannelID = process.env.EMOJI_NOTICE_CHANNEL_ID;

const message = (userID: string): string =>
  messageTemplate.replace('username', `<@${userID}>`);

app.command('/zli', async ({ command, context, ack }) => {
  ack();
  switch (command.text) {
    case 'test:team_join':
      try {
        const { user_id } = command;

        const result = await app.client.chat.postMessage({
          token: context.botToken,
          channel: command.channel_id,
          text: message(user_id),
        });

        console.log(result);
      } catch (e) {
        console.error(e);
      }
  }
});

app.event('team_join', async ({ event, context }) => {
  try {
    const { id: userID } = event.user as { id: string };

    const result = await app.client.chat.postMessage({
      token: context.botToken,
      channel: postChannelID,
      text: message(userID),
    });

    console.log(result);
  } catch (e) {
    console.error(e);
  }
});

app.event('emoji_changed', async ({ event, context }) => {
  try {
    const { subtype } = event as { subtype: 'add' | 'remove' };

    switch (subtype) {
      case 'add':
        const { name } = event as { name: string };
        const result = await app.client.chat.postMessage({
          token: context.botToken,
          channel: emojiNoticeChannelID,
          text: `絵文字が追加されました\n:${name}:`,
        });
        console.log(result);
        return;
      case 'remove':
        return;
    }
  } catch (e) {
    console.error(e);
  }
});

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡ Running Slack Bot with bolts.');
  } catch (e) {
    console.error(e);
    return;
  }
})();
