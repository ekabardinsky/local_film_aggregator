FROM node:alpine
WORKDIR /srv/app
COPY . .
RUN yarn install
EXPOSE 8080
ENV NODE_ENV=production
CMD [ "node", "index.js" ]