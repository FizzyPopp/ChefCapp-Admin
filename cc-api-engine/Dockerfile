FROM node:14-buster

ARG npm_package=build/deploy.tgz

ENV NODE_ENV=production
ENV GOOGLE_APPLICATION_CREDENTIALS="/run/secrets/chefcapp_service_key.json"
ENV FIREBASE_CONFIG={}
ENV GCLOUD_PROJECT={}


# Create app directory
WORKDIR /ccapi

# Bundle app source
COPY $npm_package ./

# Install app dependencies
RUN npm install -g /ccapi/deploy.tgz
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 3000

CMD [ "ccapi-run" ]
