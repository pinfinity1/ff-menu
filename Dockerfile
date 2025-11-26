# 1. استفاده از نود سبک آلپاین
FROM node:20-alpine

WORKDIR /app

# نصب پکیج‌های سیستمی لازم برای پریسما
RUN apk add --no-cache openssl libc6-compat

# 2. کپی کردن فایل‌های وابستگی
COPY package*.json ./

# نصب پکیج‌ها
RUN npm install

# 3. کپی کردن کل سورس کد
COPY . .

# 4. 🔥 نکته طلایی: تولید کلاینت پریسما در زمان بیلد
# این دستور فایل‌های مورد نیاز پریسما را در node_modules می‌سازد
RUN npx prisma generate

# 5. بیلد کردن پروژه نکست (برای پروداکشن)
# این دستور پوشه .next را تولید می‌کند
RUN npm run build

# 6. پورت و دستور اجرا
EXPOSE 3000

# در پروداکشن ما npm start می‌زنیم نه dev
CMD ["npm", "start"]