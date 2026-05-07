FROM node:20-slim

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY index.html ./
COPY script.js ./
COPY styles.css ./
COPY README.md ./
COPY abrir-site.cmd ./

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server.js"]
