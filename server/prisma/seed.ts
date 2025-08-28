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

  // Create admin user
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

  // Create sales rep users
  const salesRep1 = await prisma.user.upsert({
    where: { email: 'john.smith@bizhub.com' },
    update: {},
    create: {
      email: 'john.smith@bizhub.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-0002',
      roleId: salesRepRole.id,
    },
  });

  const salesRep2 = await prisma.user.upsert({
    where: { email: 'sarah.jones@bizhub.com' },
    update: {},
    create: {
      email: 'sarah.jones@bizhub.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Jones',
      phone: '+1-555-0003',
      roleId: salesRepRole.id,
    },
  });

  console.log('✅ Users created');

  // Create sample contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        email: 'mike.wilson@techcorp.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        phone: '+1-555-1001',
        company: 'TechCorp Inc.',
        position: 'CTO',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        notes: 'Interested in enterprise CRM solution',
        tags: ['enterprise', 'tech', 'decision-maker'],
        userId: adminUser.id,
      },
    }),
    prisma.contact.create({
      data: {
        email: 'lisa.chen@startupco.com',
        firstName: 'Lisa',
        lastName: 'Chen',
        phone: '+1-555-1002',
        company: 'StartupCo',
        position: 'Founder',
        address: '456 Innovation Ave',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        country: 'USA',
        notes: 'Growing startup looking for scalable CRM',
        tags: ['startup', 'growing', 'founder'],
        userId: salesRep1.id,
      },
    }),
    prisma.contact.create({
      data: {
        email: 'robert.brown@retailchain.com',
        firstName: 'Robert',
        lastName: 'Brown',
        phone: '+1-555-1003',
        company: 'RetailChain',
        position: 'Operations Manager',
        address: '789 Commerce Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        notes: 'Multiple store locations, needs centralized CRM',
        tags: ['retail', 'multi-location', 'operations'],
        userId: salesRep2.id,
      },
    }),
  ]);

  console.log('✅ Contacts created');

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@techcorp.com',
        phone: '+1-555-1001',
        company: 'TechCorp Inc.',
        position: 'CTO',
        title: 'TechCorp Enterprise CRM Implementation',
        description: 'Large enterprise looking for comprehensive CRM solution',
        status: 'QUALIFIED',
        source: 'REFERRAL',
        score: 85,
        value: 50000.00,
        expectedCloseDate: new Date('2024-06-30'),
        notes: 'High priority lead, decision maker identified',
        tags: ['enterprise', 'high-value', 'qualified'],
        user: { connect: { id: adminUser.id } },
        contact: { connect: { id: contacts[0].id } },
        assignedTo: { connect: { id: salesRep1.id } },
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Lisa',
        lastName: 'Chen',
        email: 'lisa.chen@startupco.com',
        phone: '+1-555-1002',
        company: 'StartupCo',
        position: 'Founder',
        title: 'StartupCo Growth CRM',
        description: 'Fast-growing startup needs scalable CRM',
        status: 'CONTACTED',
        source: 'WEBSITE',
        score: 70,
        value: 15000.00,
        expectedCloseDate: new Date('2024-07-15'),
        notes: 'Budget approved, technical evaluation in progress',
        tags: ['startup', 'growing', 'budget-approved'],
        user: { connect: { id: salesRep1.id } },
        contact: { connect: { id: contacts[1].id } },
        assignedTo: { connect: { id: salesRep2.id } },
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'robert.brown@retailchain.com',
        phone: '+1-555-1003',
        company: 'RetailChain',
        position: 'Operations Manager',
        title: 'RetailChain Multi-Store CRM',
        description: 'Retail chain with 15 locations needs unified CRM',
        status: 'NEW',
        source: 'EMAIL_CAMPAIGN',
        score: 60,
        value: 25000.00,
        expectedCloseDate: new Date('2024-08-30'),
        notes: 'Initial contact made, needs more information',
        tags: ['retail', 'multi-location', 'new'],
        user: { connect: { id: salesRep2.id } },
        contact: { connect: { id: contacts[2].id } },
        assignedTo: { connect: { id: salesRep1.id } },
      },
    }),
  ]);

  console.log('✅ Leads created');

  // Create sample deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: 'TechCorp Enterprise License',
        description: '500-user enterprise CRM license',
        status: 'NEGOTIATION',
        value: 50000.00,
        probability: 80,
        expectedCloseDate: new Date('2024-06-30'),
        notes: 'Contract terms being finalized',
        tags: ['enterprise', 'high-value', 'negotiation'],
        user: { connect: { id: adminUser.id } },
        contact: { connect: { id: contacts[0].id } },
        lead: { connect: { id: leads[0].id } },
        assignedTo: { connect: { id: salesRep1.id } },
      },
    }),
    prisma.deal.create({
      data: {
        title: 'StartupCo Growth Package',
        description: '100-user startup CRM package',
        status: 'PROPOSAL',
        value: 15000.00,
        probability: 70,
        expectedCloseDate: new Date('2024-07-15'),
        notes: 'Proposal submitted, waiting for feedback',
        tags: ['startup', 'growth', 'proposal'],
        user: { connect: { id: salesRep1.id } },
        contact: { connect: { id: contacts[1].id } },
        lead: { connect: { id: leads[1].id } },
        assignedTo: { connect: { id: salesRep2.id } },
      },
    }),
  ]);

  console.log('✅ Deals created');

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Follow up with TechCorp decision makers',
        description: 'Schedule demo for executive team',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date('2024-05-20'),
        notes: 'Need to include technical team in demo',
        tags: ['follow-up', 'demo', 'executive'],
        user: { connect: { id: adminUser.id } },
        assignedTo: { connect: { id: salesRep1.id } },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Prepare StartupCo proposal',
        description: 'Create detailed proposal with pricing',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date('2024-05-25'),
        notes: 'Include customization options',
        tags: ['proposal', 'pricing', 'customization'],
        user: { connect: { id: salesRep1.id } },
        assignedTo: { connect: { id: salesRep2.id } },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Research RetailChain requirements',
        description: 'Understand multi-store operations',
        status: 'PENDING',
        priority: 'LOW',
        dueDate: new Date('2024-06-01'),
        notes: 'Schedule discovery call',
        tags: ['research', 'discovery', 'multi-store'],
        user: { connect: { id: salesRep2.id } },
        assignedTo: { connect: { id: salesRep1.id } },
      },
    }),
  ]);

  console.log('✅ Tasks created');

  // Create sample activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        type: 'CALL',
        title: 'Initial contact with TechCorp',
        description: 'Introduced BizHub CRM solution',
        duration: 30,
        scheduledAt: new Date('2024-05-15T10:00:00Z'),
        completedAt: new Date('2024-05-15T10:30:00Z'),
        notes: 'Positive response, interested in enterprise features',
        tags: ['initial-contact', 'enterprise', 'positive'],
        user: { connect: { id: salesRep1.id } },
        lead: { connect: { id: leads[0].id } },
      },
    }),
    prisma.activity.create({
      data: {
        type: 'DEMO',
        title: 'Product demo for StartupCo',
        description: 'Showcased key features and benefits',
        duration: 60,
        scheduledAt: new Date('2024-05-16T14:00:00Z'),
        completedAt: new Date('2024-05-16T15:00:00Z'),
        notes: 'Team was impressed with scalability features',
        tags: ['demo', 'startup', 'scalability'],
        user: { connect: { id: salesRep2.id } },
        lead: { connect: { id: leads[1].id } },
      },
    }),
    prisma.activity.create({
      data: {
        type: 'EMAIL',
        title: 'Follow-up email to RetailChain',
        description: 'Sent company overview and case studies',
        duration: 15,
        scheduledAt: new Date('2024-05-17T09:00:00Z'),
        completedAt: new Date('2024-05-17T09:15:00Z'),
        notes: 'Included retail-specific case studies',
        tags: ['follow-up', 'email', 'case-studies'],
        user: { connect: { id: salesRep1.id } },
        lead: { connect: { id: leads[2].id } },
      },
    }),
  ]);

  console.log('✅ Activities created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Sample data created:');
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
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
