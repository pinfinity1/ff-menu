# === مرحله ۱: نصب وابستگی‌ها ===
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app


COPY package*.json ./
RUN npm ci

# === مرحله ۲: بیلد پروژه ===
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ساخت کلاینت پریسما و بیلد نکست
RUN npx prisma generate
RUN npm run build

# === مرحله ۳: اجرای نهایی ===
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# نصب پکیج‌های لازم برای آپدیت دیتابیس
RUN apk add --no-cache openssl


RUN npm install -g prisma@6

# کپی فایل‌های ضروری از مرحله بیلد
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# کپی موتورهای پریسما
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

EXPOSE 3000

# اعمال مایگریشن دیتابیس، اجرای سید و استارت سرور
CMD sh -c "prisma db push && node prisma/seed.js && node server.js"