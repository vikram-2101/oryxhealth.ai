import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from '../models/Customer.js';
import AppointmentType from '../models/AppointmentType.js';

dotenv.config();

const seedAppointmentTypes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const customers = await Customer.find({});
    const defaultTypes = ['Consult', 'Screening', 'Monitoring', 'Follow-up', 'Rehab'];

    for (const customer of customers) {
      console.log(`Seeding types for ${customer.name}...`);
      for (const typeName of defaultTypes) {
        try {
          await AppointmentType.findOneAndUpdate(
            { name: typeName, accountId: customer._id },
            { name: typeName, accountId: customer._id },
            { upsert: true, new: true }
          );
        } catch (err) {
          console.error(`Failed to seed ${typeName} for ${customer.name}: ${err.message}`);
        }
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedAppointmentTypes();
