FROM node:latest

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

COPY . /app


RUN mkdir ./db

CMD npm run build
CMD npm run populate
CMD npm run start


EXPOSE 8080
