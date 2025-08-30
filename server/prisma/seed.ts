import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
      permissions: ['*'],
    },
  });

  const salesRepRole = await prisma.role.upsert({
    where: { name: 'sales_rep' },
    update: {},
    create: {
      name: 'sales_rep',
      description: 'Sales representative with limited access',
      permissions: ['leads:read', 'leads:write', 'deals:read', 'deals:write', 'contacts:read', 'contacts:write'],
    },
  });

  console.log('✅ Roles created');

  // Create admin user only
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bizhub.com' },
    update: {},
    create: {
      email: 'admin@bizhub.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-555-0001',
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created');

  // Clear all existing data (except users and roles)
  await prisma.contact.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.knowledgeBase.deleteMany({});

  console.log('✅ All sample data cleared');

  console.log('\n📊 Database Summary:');
  console.log(`   - ${await prisma.role.count()} roles`);
  console.log(`   - ${await prisma.user.count()} users`);
  console.log(`   - ${await prisma.contact.count()} contacts`);
  console.log(`   - ${await prisma.lead.count()} leads`);
  console.log(`   - ${await prisma.deal.count()} deals`);
  console.log(`   - ${await prisma.task.count()} tasks`);
  console.log(`   - ${await prisma.activity.count()} activities`);
  console.log('\n🔑 Default admin credentials:');
  console.log('   Email: admin@bizhub.com');
  console.log('   Password: admin123');
  console.log('\n💡 The system is now ready for dynamic data entry!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
