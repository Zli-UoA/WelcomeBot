import { App } from '@slack/bolt';
import * as Env from 'dotenv';
import * as fs from 'fs';

if (process.env.NODE_ENV === 'dev') Env.config();

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const postChannelID = process.env.POST_CHANNEL_ID;
const dmMessageTemplate = fs.readFileSync("dm_template.txt", "utf-8");
const joinLogTemplate = fs.readFileSync("join_log.txt", "utf-8");
const emojiNoticeChannelID = process.env.EMOJI_NOTICE_CHANNEL_ID;

const dmMessage = (userID: string): string =>
  dmMessageTemplate.replace('username', `<@${userID}>`);
const joinLog = (userID: string): string =>
    joinLogTemplate.replace('username', `<@${userID}>`);

app.command('/zli', async ({ command, context, ack }) => {
  ack();
  switch (command.text) {
    case 'test:team_join':
      try {
        const { user_id } = command;

        const res = await app.client.conversations.open({
          token: context.botToken,
          users: user_id
        })

        await app.client.chat.postMessage({
          token: context.botToken,
          channel: res.channel.id,
          text: dmMessage(user_id),
        });
        await app.client.chat.postMessage({
          token: context.botToken,
          channel: command.channel_id,
          text: joinLog(user_id)
        })
      } catch (e) {
        console.error(e);
      }
  }
});

app.event('team_join', async ({ event, context }) => {
  try {
    const { id: user_id } = event.user as { id: string };

    const res = await app.client.conversations.open({
      token: context.botToken,
      users: user_id
    })

    await app.client.chat.postMessage({
      token: context.botToken,
      channel: res.channel.id,
      text: dmMessage(user_id),
    });
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: postChannelID,
      text: joinLog(user_id)
    })
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
    await app.start(Number(process.env.PORT) || 3000);
    console.log('⚡ Running Slack Bot with bolts.');
  } catch (e) {
    console.error(e);
    return;
  }
})();
