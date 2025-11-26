# استفاده از نسخه Alpine که بسیار سبک‌تر و سازگارتر است
FROM node:20-alpine

WORKDIR /app

# نصب پکیج‌های لازم برای Prisma در Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]