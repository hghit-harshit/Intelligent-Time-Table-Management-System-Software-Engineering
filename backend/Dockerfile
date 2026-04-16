FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY dist/ .

EXPOSE 5001

CMD ["node", "dist/server.js"]