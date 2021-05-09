FROM node:16-alpine

WORKDIR /app
RUN npm install hcl-to-json
COPY validate.js .

ENTRYPOINT ["node", "/app/validate.js"]
