import { App } from "@slack/bolt";
import * as Env from "dotenv";

if (process.env.NODE_ENV === "dev") Env.config();

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const postChannelID = process.env.POST_CHANNEL_ID;

app.event('team_join', async ({ event, context }) => {
  try {
    const { id: userID } = (event.user as { id: string });

    const result = await app.client.chat.postMessage({
      token: context.botToken,
      channel: postChannelID,
      text: `<@${ userID }>がSlackに参加しました! ようこそ Zliへ!`
    });

    console.log(result);
  } catch (e) {
    console.error(e);
  }
});

(async () => {
  try {
    await app.start(process.env.PORT || 3000)
    console.log("⚡ Running Slack Bot with bolts.");
  } catch(e) {
    console.error(e);
    return;
  }
})();
