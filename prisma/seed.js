const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs"); //

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  console.log(`👤 در حال تنظیم کاربر: ${username}`);

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username: username },
    update: {
      passwordHash: passwordHash,
    },
    create: {
      username: username,
      passwordHash: passwordHash,
    },
  });

  console.log(`✅ کاربر ادمین (${username}) با موفقیت تنظیم شد.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
