FROM node:14-buster

ENV NODE_ENV=production

# Create app directory
WORKDIR /ccapi

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . .

# Install app dependencies
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 6968

CMD [ "node", "server.js" ]
