FROM node:18-alpine

# Install Docker client
RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create necessary directories
RUN mkdir -p logs temp

# The execution engine is typically used as a module by the API server
# But we can also set up a sample entrypoint for container health checks
CMD ["node", "-e", "console.log('Execution Engine is ready'); setInterval(() => {}, 3600000);"]