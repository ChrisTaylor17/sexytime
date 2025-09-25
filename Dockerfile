FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/ ./backend/

# Install dependencies
RUN cd backend && npm install --omit=dev

EXPOSE 8080

CMD ["node", "backend/server.js"]