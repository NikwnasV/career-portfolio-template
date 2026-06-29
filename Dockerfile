# Stage 1: Build the Astro static site
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency files and install them
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the project files and build
COPY . .
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine
# Copy the built files from the previous stage into Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 inside the container
EXPOSE 80
