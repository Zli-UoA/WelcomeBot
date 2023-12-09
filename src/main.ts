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
const channelCreatedNoticeChannelID = process.env.CHANNEL_CREATED_NOTICE_CHANNEL_ID;

const dmMessage = (userID: string): string =>
  dmMessageTemplate.replace('username', `<@${userID}>`);
const joinLog = (userID: string): string =>
    joinLogTemplate.replace('username', `<@${userID}>`);

app.command('/zli', async ({ command, context, ack }) => {
  ack();
  switch (command.text) {
    case 'test:team_join':
      try {
        const { user_id, is_restricted } = command;
console.log(`id: ${user_id}  isGuest: ${is_restricted}`);
        const res = await app.client.conversations.open({
          token: context.botToken,
          users: user_id
        })
	if(is_restricted === false){
          await app.client.chat.postMessage({
            token: context.botToken,
            channel: command.channel_id,
          text: dmMessage(user_id),
          })
	}
        await app.client.chat.postMessage({
          token: context.botToken,
          channel: command.channel_id,
            text: joinLog(user_id)
        });
      } catch (e) {
        console.error(e);
      }
  }
});

app.event('team_join', async ({ event, context }) => {
  try {
    const { id: user_id, is_restricted: isGuest } = event.user as { id: string, is_restricted: boolean };
    console.log(`id: ${user_id}  isGuest: ${isGuest}`);

    const res = await app.client.conversations.open({
      token: context.botToken,
      users: user_id
    })
    if(isGuest === true){
      // シングルorマルチチャンネルゲスト
      await app.client.chat.postMessage({
        token: context.botToken,
        channel: postChannelID,
        text: joinLog(user_id)
      })
    }
    if(isGuest === false){
     await app.client.chat.postMessage({
       token: context.botToken,
       channel: postChannelID,
       text: dmMessage(user_id),
     });
    }
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

app.event('channel_created', async ({ event, context }) => {
  try {
    const { id, creator } = event.channel;
    const text = `<@${creator}>が<#${id}>を作りました`;
    console.log(text);
     await app.client.chat.postMessage({
      token: context.botToken,
      channel: channelCreatedNoticeChannelID,
      text
    });
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
