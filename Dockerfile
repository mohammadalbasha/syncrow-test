# Use the official Node.js image as the base image
FROM node:20

# Create app directory and set proper permissions
WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app

#USER node

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Set proper ownership and permissions
# RUN chown -R node:node /usr/src/app
#USER root
#RUN chmod +x docker-entrypoint.sh
#USER node

# Expose the application port
EXPOSE 3000


#ENTRYPOINT ["./docker-entrypoint.sh"]
#RUN npm run db:seed


CMD ["node", "dist/main.js"]
