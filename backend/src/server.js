const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { Client } = require('@notionhq/client');
const GoogleCalendarSync = require('./services/google-calendar');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_KEY });
const googleSync = new GoogleCalendarSync();
const cache = new Map();
const CACHE_DURATION = 30000;

// Daily sync function
async function performDailySync() {
  try {
    console.log('🔄 Starting daily calendar sync...');
    
    const [bookingsResponse, maintenanceResponse] = await Promise.all([
      notion.databases.query({ database_id: process.env.NOTION_BOOKINGS_DB_ID }),
      notion.databases.query({ database_id: process.env.NOTION_MAINTENANCE_DB_ID })
    ]);
    
    // Sync bookings
    for (const page of bookingsResponse.results) {
      const booking = {
        id: page.id,
        CustomerName: page.properties.Contact?.title?.[0]?.text?.content || 'Unknown',
        Destination: page.properties['Company/Org/Person']?.rich_text?.[0]?.text?.content || 'Unknown',
        StartDate: page.properties.Dates?.date?.start,
        EndDate: page.properties.Dates?.date?.end || page.properties.Dates?.date?.start,
        Amount: page.properties.Amount?.number || 0,
        CustomerPhone: page.properties.Advance?.number?.toString() || ''
      };
      if (booking.StartDate) await googleSync.syncBooking(booking);
    }
    
    // Sync maintenance
    for (const page of maintenanceResponse.results) {
      const maintenance = {
        id: page.id,
        'Service Type': page.properties['Service Type']?.multi_select?.map(item => item.name).join(', ') || 'Service',
        Vehicle: page.properties.Vehicle?.relation?.[0]?.id || 'Unknown',
        'Service Date': page.properties['Service Date']?.date?.start,
        Cost: page.properties.Cost?.number || 0,
        Notes: page.properties.Notes?.rich_text?.[0]?.text?.content || page.properties.Name?.title?.[0]?.text?.content || ''
      };
      if (maintenance['Service Date']) await googleSync.syncMaintenance(maintenance);
    }
    
    console.log('✅ Daily sync completed');
  } catch (error) {
    console.error('❌ Daily sync error:', error);
  }
}

// Schedule daily sync at 2 AM
cron.schedule('0 2 * * *', performDailySync);

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    timestamp: new Date().toISOString(),
    notionKey: process.env.NOTION_KEY ? 'Present' : 'Missing'
  });
});

app.post('/api/databases/:id/query', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `db_${id}`;
  const now = Date.now();
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (now - timestamp < CACHE_DURATION) {
      return res.json(data);
    }
  }
  
  try {
    const response = await notion.databases.query({ database_id: id });
    cache.set(cacheKey, { data: response, timestamp: now });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pages', async (req, res) => {
  try {
    const response = await notion.pages.create(req.body);
    
    // Sync to Google Calendar
    const pageData = response.properties;
    if (req.body.parent.database_id === process.env.NOTION_BOOKINGS_DB_ID) {
      await googleSync.syncBooking({ id: response.id, ...pageData });
    } else if (req.body.parent.database_id === process.env.NOTION_MAINTENANCE_DB_ID) {
      await googleSync.syncMaintenance({ id: response.id, ...pageData });
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post('/api/sync-now', async (req, res) => {
  await performDailySync();
  res.json({ success: true, message: 'Sync completed' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 Daily sync scheduled at 2 AM`);
});