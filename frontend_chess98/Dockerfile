FROM node:18-slim  AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV NEXT_PUBLIC_API_URL=https://api.chess98.com
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]