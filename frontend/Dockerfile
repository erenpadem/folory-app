# Development
FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps 
COPY . .
CMD ["npm", "run", "dev"]

# Production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps 
COPY . .
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]