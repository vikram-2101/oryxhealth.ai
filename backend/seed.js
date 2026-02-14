import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import Admin from './src/models/Admin.js';
import Customer from './src/models/Customer.js';
import Institution from './src/models/Institution.js';
import User from './src/models/User.js';
import Panel from './src/models/Panel.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Admin.deleteMany();
    await Customer.deleteMany();
    await Institution.deleteMany();
    await User.deleteMany();
    await Panel.deleteMany();

    // Create Super Admin
    console.log('👤 Creating Super Admin...');
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@oxyhealth.ai',
      password: 'admin123',
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create Customers
    console.log('\n🏢 Creating Customers...');
    const customers = await Customer.create([
      {
        name: 'MedVita Health Systems',
        logo: 'https://ui-avatars.com/api/?name=MH&background=3b82f6&color=fff',
        banner: '',
        contactPerson: {
          name: 'Sarah Johnson',
          email: 'sarah@medvita.com',
          phone: '+1 555-0101',
        },
        status: 'active',
      },
      {
        name: 'CarePoint Networks',
        logo: 'https://ui-avatars.com/api/?name=CP&background=10b981&color=fff',
        banner: '',
        contactPerson: {
          name: 'James Wilson',
          email: 'james@carepoint.com',
          phone: '+1 555-0102',
        },
        status: 'active',
      },
    ]);
    console.log(`✅ Created ${customers.length} customers`);

    // Create Institutions
    console.log('\n🏥 Creating Institutions...');
    const institutions = await Institution.create([
      {
        name: 'City General Hospital',
        logo: 'https://ui-avatars.com/api/?name=CG&background=8b5cf6&color=fff',
        banner: '',
        contactPerson: {
          name: 'Emily Davis',
          email: 'emily@citygeneral.com',
          phone: '+1 555-0201',
        },
        customerAccount: customers[0]._id,
        status: 'active',
      },
      {
        name: 'Riverside Community Clinic',
        logo: 'https://ui-avatars.com/api/?name=RC&background=f59e0b&color=fff',
        banner: '',
        contactPerson: {
          name: 'Kelly Brown',
          email: 'kelly@riverside.com',
          phone: '+1 555-0202',
        },
        customerAccount: customers[0]._id,
        status: 'active',
      },
      {
        name: 'Sunrise Wellness Center',
        logo: 'https://ui-avatars.com/api/?name=SW&background=ec4899&color=fff',
        banner: '',
        contactPerson: {
          name: 'Isaac Martinez',
          email: 'isaac@sunrise.com',
          phone: '+1 555-0203',
        },
        customerAccount: customers[1]._id,
        status: 'active',
      },
      {
        name: 'Horizon Research Lab',
        logo: 'https://ui-avatars.com/api/?name=HR&background=6366f1&color=fff',
        banner: '',
        contactPerson: {
          name: 'Pavel Rodriguez',
          email: 'pavel@horizonlab.com',
          phone: '+1 555-0204',
        },
        customerAccount: customers[1]._id,
        status: 'inactive',
      },
    ]);
    console.log(`✅ Created ${institutions.length} institutions`);

    // Create Users
    console.log('\n👥 Creating Users...');
    const users = await User.create([
      {
        name: 'Dr. Alan Hughes',
        role: 'Doctor',
        address: '123 Medical Plaza, Suite 100',
        phone: '+1 555-1001',
        email: 'alan@citygeneral.com',
        institution: institutions[0]._id,
        registrationNumber: 'MD-2024-001',
        signatureImage: 'https://via.placeholder.com/200x80?text=Signature',
        status: 'active',
      },
      {
        name: 'Linda Park',
        role: 'Health Worker',
        address: '456 Care Street',
        phone: '+1 555-1002',
        email: 'linda@citygeneral.com',
        institution: institutions[0]._id,
        status: 'active',
      },
      {
        name: 'Carlos Mendez',
        role: 'Coordinator',
        address: '789 Admin Building',
        phone: '+1 555-1003',
        email: 'carlos@citygeneral.com',
        institution: institutions[0]._id,
        status: 'active',
      },
      {
        name: 'Dr. Fatima Al-Rashid',
        role: 'Doctor',
        address: '321 Riverside Drive',
        phone: '+1 555-1004',
        email: 'fatima@riverside.com',
        institution: institutions[1]._id,
        registrationNumber: 'MD-2024-002',
        signatureImage: 'https://via.placeholder.com/200x80?text=Signature',
        status: 'active',
      },
      {
        name: "James O'Brien",
        role: 'Health Worker',
        address: '654 Wellness Ave',
        phone: '+1 555-1005',
        email: 'james@sunrise.com',
        institution: institutions[2]._id,
        status: 'active',
      },
      {
        name: 'Dr. Priya Sharma',
        role: 'Doctor',
        address: '987 Sunrise Blvd',
        phone: '+1 555-1006',
        email: 'priya@sunrise.com',
        institution: institutions[2]._id,
        registrationNumber: 'MD-2024-003',
        signatureImage: 'https://via.placeholder.com/200x80?text=Signature',
        status: 'active',
      },
      {
        name: 'Robert Kim',
        role: 'Coordinator',
        address: '147 Research Park',
        phone: '+1 555-1007',
        email: 'robert@horizonlab.com',
        institution: institutions[3]._id,
        status: 'inactive',
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Panels
    console.log('\n🔧 Creating Panels...');
    const panels = await Panel.create([
      {
        name: 'Primary Care Panel',
        users: [users[0]._id, users[1]._id, users[2]._id],
        status: 'active',
      },
      {
        name: 'Emergency Response Team',
        users: [users[3]._id, users[4]._id],
        status: 'active',
      },
      {
        name: 'Research Division',
        users: [users[5]._id],
        status: 'inactive',
      },
    ]);
    console.log(`✅ Created ${panels.length} panels`);

    console.log('\n✨ Seed data created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Email: admin@oxyhealth.ai');
    console.log('   Password: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
