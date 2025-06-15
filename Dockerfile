# Use Node.js LTS version with security updates
FROM node:20-alpine3.19

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies with security audit
RUN npm install && \
    npm audit fix --force || true

# Bundle app source
COPY . .

# Set ownership
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "dev"] 