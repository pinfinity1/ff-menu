// A) ایمپورت کردن پکیج‌های مورد نیاز
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// B) تابع اصلی برای اجرای Seed
async function main() {
  const username = "admin";
  const password = "admin123"; // <-- این رمز عبور را حتما عوض کنید

  // هش کردن رمز عبور
  const passwordHash = await bcrypt.hash(password, 10);

  // C) استفاده از Upsert برای جلوگیری از ایجاد کاربر تکراری
  // اگر کاربری با نام 'admin' وجود داشت، کاری نمی‌کند.
  // اگر وجود نداشت، آن را ایجاد می‌کند.
  await prisma.user.upsert({
    where: { username: username },
    update: {
      // اگر می‌خواهید با هر بار اجرای seed رمز عبور آپدیت شود، خط زیر را از کامنت درآورید
      passwordHash: passwordHash,
    },
    create: {
      username: username,
      passwordHash: passwordHash,
    },
  });

  console.log(`✅ کاربر ادمین (${username}) ایجاد یا به‌روزرسانی شد.`);
}

// D) اجرای تابع اصلی و بستن اتصال دیتابیس
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
