# 1. Use a lightweight Node.js environment
FROM node:20-alpine

# 2. Set the working directory inside the cloud container
WORKDIR /app

# 3. Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# 4. Install dependencies
RUN npm install

# 5. Copy all other backend files (src, tsconfig, etc.)
COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost/dummy"
# 6. Run your build script (Compiles TypeScript and generates Prisma client)
RUN npm run build

# 7. Expose port 8080 (Required by Cloud Run)
EXPOSE 8080

# 8. Start the production server
CMD ["npm", "start"]