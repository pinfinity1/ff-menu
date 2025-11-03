# === مرحله ۱: بیلد (Builder) ===
# از ایمیج Alpine که سبک است استفاده می‌کنیم
FROM node:lts-alpine AS builder

# ۱. نصب وابستگی‌های لازم برای Prisma (openssl) و Next.js (libc6-compat)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# ۲. کپی کردن package.json و نصب *تمام* وابستگی‌ها (شامل devDependencies)
COPY package*.json ./
RUN npm install

# ۳. کپی کردن schema پریزما و ساخت کلاینت
# (جدا از سورس کد برای بهینه‌سازی کش)
COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

# ۴. کپی کردن بقیه سورس کد پروژه
COPY . .

# ۵. بیلد کردن پروژه
# Next.js به صورت خودکار پوشه‌ی .next/standalone را می‌سازد
RUN npm run build

# === مرحله ۲: اجرا (Runner) ===
# شروع مجدد از یک ایمیج تمیز و سبک
FROM node:lts-alpine AS runner
WORKDIR /app

# ۱. نصب وابستگی‌های لازم برای *اجرای* Prisma
RUN apk add --no-cache libc6-compat openssl

# ۲. کپی کردن فایل‌های بیلد شده از مرحله 'builder'
# این شامل node_modules مورد نیاز هم می‌شود
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# ۳. کپی کردن پوشه public
COPY --from=builder /app/public ./public

# ۴. کپی کردن schema (مورد نیاز برای Prisma Client در حالت اجرا)
COPY --from=builder /app/prisma/schema.prisma ./prisma/

# ۵. تنظیم پورت و اجرای سرور
EXPOSE 3000
ENV PORT 3000

# ۶. اجرای سرور Next.js در حالت standalone
CMD ["node", "server.js"]