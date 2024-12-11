# Use a Node.js base image
FROM node:18-slim

# Set environment variables for Puppeteer
ENV PUPPETEER_CACHE_DIR=/home/node/.cache/puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

# Install dependencies and Chromium
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/chromium-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/chromium-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/chrome.list && \
    apt-get update && \
    apt-get install -y chromium && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Ensure Puppeteer can write to its cache directory
RUN mkdir -p $PUPPETEER_CACHE_DIR && \
    chown -R node:node $PUPPETEER_CACHE_DIR

# Run the application as a non-root user
USER node

# Expose the application port (if applicable)
EXPOSE 3000

# Command to start the app
CMD ["node", "index.js"]
