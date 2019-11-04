# WelcomeBot

## Discription

Slackに新規に参加したユーザーを歓迎してくれるBot

## How to start

### Develop

- `npm install`
- `.env` ファイルに下記の環境変数を記入
- `npm run dev` をして `node dist/main.js` を実行

### Production

好きなサーバーにNode環境を作ってDeployするか，dockerfileを元にDockerImageを作成して
CloudRun等にDeployしてください.

## Environment Valiables

- SLACK_SIGNING_SECRET : SigningSecret
- SLACK_TOKEN : BotToken
- POST_CHANNEL_ID : ChannelID

## How to use

ワークスペースに新規で参加すると `POST_CHANNEL_ID` で指定したチャンネルにメッセージが投稿されます。

