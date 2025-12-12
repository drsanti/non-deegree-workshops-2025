FROM nodered/node-red:latest

# Switch to root to install packages
USER root

# Copy package.json
COPY package.json /data/package.json

# Install FlowFuse Dashboard and other dependencies
RUN cd /data && npm install --production --unsafe-perm

# Copy flows
COPY flows.json /data/flows.json

# Switch back to node-red user
USER node-red

