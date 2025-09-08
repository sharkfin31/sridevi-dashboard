const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { Client } = require('@notionhq/client');
const GoogleCalendarSync = require('./services/google-calendar');
require('dotenv').config();

// Simple feature flags from environment
const FEATURES = {
  DAILY_SYNC: process.env.DAILY_SYNC === 'true',
};

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_KEY });
const googleSync = new GoogleCalendarSync();
const cache = new Map();
const CACHE_DURATION = 30000;

async function performDailySync() {
  if (!FEATURES.DAILY_SYNC) {
    console.log('🔄 Daily sync disabled');
    return;
  }

  try {
    console.log('🔄 Starting daily sync...');
    
    if (googleSync) {
      const [bookingsResponse, maintenanceResponse] = await Promise.all([
        notion.databases.query({ database_id: process.env.NOTION_BOOKINGS_DB_ID }),
        notion.databases.query({ database_id: process.env.NOTION_MAINTENANCE_DB_ID })
      ]);
      
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
      
      for (const page of maintenanceResponse.results) {
        const maintenance = {
          id: page.id,
          Vehicle: page.properties.Vehicle?.relation?.[0]?.id || 'Unknown',
          'Service Type': page.properties['Service Type']?.multi_select?.map(item => item.name).join(', ') || 'Service',
          Details: page.properties.Details?.rich_text?.[0]?.text?.content || 'General Checkup',
          Cost: page.properties.Cost?.number || 0,
          StartDate: page.properties['Service Dates']?.date?.start,
          EndDate: page.properties['Service Dates']?.date?.end || page.properties['Service Dates']?.date?.start,
          Notes: page.properties.Notes?.rich_text?.[0]?.text?.content || page.properties.Name?.title?.[0]?.text?.content || ''
        };
        if (maintenance['Service Date']) await googleSync.syncMaintenance(maintenance);
      }
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
    notionKey: process.env.NOTION_KEY ? 'Present' : 'Missing',
    features: FEATURES
  });
});

app.post('/api/databases/:id/query', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `db_${id}`;
  const now = Date.now();
  
  console.log(`🔍 Backend: Querying database ${id}`);
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (now - timestamp < CACHE_DURATION) {
      console.log(`💾 Backend: Returning cached data for ${id}`);
      return res.json(data);
    }
  }
  
  try {
    const response = await notion.databases.query({ database_id: id });
    console.log(`✅ Backend: Database query success for ${id}, results: ${response.results?.length || 0}`);
    cache.set(cacheKey, { data: response, timestamp: now });
    res.json(response);
  } catch (error) {
    console.error(`❌ Backend: Database query error for ${id}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pages', async (req, res) => {
  try {
    const response = await notion.pages.create(req.body);
    
    if (FEATURES.DAILY_SYNC && googleSync) {
      const pageData = response.properties;
      if (req.body.parent.database_id === process.env.NOTION_BOOKINGS_DB_ID) {
        await googleSync.syncBooking({ id: response.id, ...pageData });
      } else if (req.body.parent.database_id === process.env.NOTION_MAINTENANCE_DB_ID) {
        await googleSync.syncMaintenance({ id: response.id, ...pageData });
      }
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.pages.update({
      page_id: id,
      ...req.body
    });
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