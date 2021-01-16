# ZliBot

## Description

Zli の色々をしてくれる bot

主にやること

- 新規 slack 参加者の通知 (#general)
- emoji の追加通知 (#notice_emoji)

### Q. なんで 1 個の bot が色々やってるの？

A. slack の無料プランではアプリを入れれる数が制限されているからです。

機能ごとに bot がいることが理想だが上記の理由によりまとめてます。
必要な機能があったら一旦 **この bot を拡張する** ことを最初に考えてみてください。
技術的に無理そうだった場合は入れれるアプリの数を見ながら対応してください。

## How to start

### Develop

- `npm install`
- `.env` ファイルに下記の環境変数を記入
- `npm run dev` をして `node dist/main.js` を実行

### Production

好きなサーバーに Node 環境を作って Deploy するか，dockerfile を元に DockerImage を作成して
CloudRun 等に Deploy してください.

現在は、Zli で借りているレンタルサーバー上で稼働しています。

## Environment Valiables

- SLACK_SIGNING_SECRET : SigningSecret
- SLACK_TOKEN : BotToken
- POST_CHANNEL_ID : ChannelID
- MESSAGE_TEMPLATE_FILE : MessageTemplateのファイル名
  - 読み込むファイルの中身 : MessageTemplate (`username` の部分が新規参加へのメンションになります)
- EMOJI_NOTICE_CHANNEL_ID : emoji の追加通知を送りたいチャンネル

## How to use

ワークスペースに新規で参加すると `POST_CHANNEL_ID` で指定したチャンネルにメッセージが投稿されます。

## How to deploy

1. レンタルサーバーへログインします。
2. `~/WelcomeBot` に移動します。
3. `git pull origin master` を実行します。
4. `docker build -t zli_bot .` を実行します。
5. `docker run --env-file .env -p 3000:3000 -d zli_bot` を実行します。

環境変数の内容(`.env` の中身)を変更した場合は、再起動してください。
