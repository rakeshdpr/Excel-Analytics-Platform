const mongoose = require('mongoose');
const ExcelData = require('../models/ExcelData');
require('dotenv').config();

async function migrateExcelData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-analytics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const docs = await ExcelData.find({});
    let updated = 0;
    for (const doc of docs) {
      let needsUpdate = false;
      let headers = doc.headers;
      let dataTypes = doc.dataTypes;
      if (!headers || !Array.isArray(headers) || headers.length === 0) {
        headers = Object.keys(doc.data || {});
        needsUpdate = true;
      }
      if (!dataTypes || typeof dataTypes !== 'object' || Object.keys(dataTypes).length === 0) {
        dataTypes = {};
        for (const key of headers) {
          const value = doc.data ? doc.data[key] : undefined;
          if (typeof value === 'number') dataTypes[key] = 'number';
          else if (typeof value === 'boolean') dataTypes[key] = 'boolean';
          else if (value && !isNaN(Date.parse(value))) dataTypes[key] = 'date';
          else dataTypes[key] = 'string';
        }
        needsUpdate = true;
      }
      if (needsUpdate) {
        await ExcelData.updateOne({ _id: doc._id }, { $set: { headers, dataTypes } });
        updated++;
      }
    }
    console.log(`🔄 Updated ${updated} ExcelData documents with missing headers/dataTypes.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating ExcelData:', error);
    process.exit(1);
  }
}

migrateExcelData();
