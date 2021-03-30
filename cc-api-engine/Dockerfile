FROM node:14-buster

ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/cca

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install -g
# If you are building your code for production
# RUN npm ci --only=production

WORKDIR /ccapi

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "server.js" ]
