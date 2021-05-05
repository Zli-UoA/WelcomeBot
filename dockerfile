FROM node:12 as builder
WORKDIR /node/src/app
ADD . /node/src/app
RUN npm i && npm run build

FROM node:14
WORKDIR /node/src/app
COPY --from=builder /node/src/app/dist/main.js /node/src/app
COPY --from=builder /node/src/app/dm_template.txt /node/src/app
COPY --from=builder /node/src/app/join_log.txt /node/src/app
CMD [ "node", "main.js" ]
