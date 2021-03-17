FROM https://hub.docker.com/layers/node/library/node/dubnium-buster/images/sha256-5f5bd232f271263ac1c625b36449e3c3f744b450cbe8786722aa0c659b1c04fe 

# Create app directory
WORKDIR /usr/src/cca

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "ccapi-run" ]
