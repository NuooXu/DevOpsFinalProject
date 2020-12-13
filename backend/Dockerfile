FROM node:12-alpine3.12
#create workspace directory if not exisit, and go into the folder
WORKDIR /workspace
COPY . ./

RUN npm install

EXPOSE 8080

CMD ["node", "db.js"]