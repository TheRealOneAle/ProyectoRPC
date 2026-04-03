FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the Vite default port
EXPOSE 5173

# Start the application specifying the host so it can be accessed outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
