FROM node:10 as builder
WORKDIR /node/src/app
ADD . /node/src/app
RUN npm i && npm run build

FROM node:10
WORKDIR /node/src/app
COPY --from=builder /node/src/app/dist/main.js /node/src/app
COPY --from=builder /node/src/app/dist/template.txt /node/src/app
CMD [ "node", "main.js" ]
