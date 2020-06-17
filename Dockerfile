FROM  node:latest

# Creating working dir
WORKDIR /usr/src/app

# Installing dependincies
COPY package*.json ./
RUN npm install
# Copy source code
COPY . .

# Expose port
EXPOSE 80
EXPOSE 8080


# Start App
CMD [ "npm","start" ]