# Use a lightweight Node.js 18 image based on Alpine Linux
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install only production dependencies (skips devDependencies)
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Expose port 8080 (Cloud Run's default port requirement)
EXPOSE 8080

# Command to run the application
CMD ["node", "src/index.js"]
