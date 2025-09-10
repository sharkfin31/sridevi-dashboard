require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const cache = require('memory-cache');
const { Client } = require('@notionhq/client');
// const GoogleCalendarSync = require('./services/google-calendar'); // Moved to disabled/
const { authenticateToken } = require('./middleware/auth');
const authService = require('./services/auth');

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
// const googleSync = new GoogleCalendarSync(); // Disabled
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function invalidateCache(pattern = null) {
  if (pattern) {
    cache.keys().forEach(key => {
      if (key.includes(pattern)) {
        cache.del(key);
      }
    });
  } else {
    cache.clear();
  }
}

async function performDailySync() {
  if (!FEATURES.DAILY_SYNC) {
    return;
  }

  try {
    // Google Calendar sync disabled
    if (false) {
      const [bookingsResponse, maintenanceResponse] = await Promise.all([
        notion.databases.query({ database_id: process.env.NOTION_BOOKINGS_DB_ID }),
        notion.databases.query({ database_id: process.env.NOTION_MAINTENANCE_DB_ID })
      ]);
      
      for (const page of bookingsResponse.results) {
        const booking = {
          id: page.id,
          CustomerName: page.properties.Customer?.title?.[0]?.text?.content || 'Unknown',
          Destination: page.properties.Itinerary?.rich_text?.[0]?.text?.content || 'Unknown',
          StartDate: page.properties.Dates?.date?.start,
          EndDate: page.properties.Dates?.date?.end || page.properties.Dates?.date?.start,
          Amount: page.properties.Total?.number || 0,
          CustomerPhone: page.properties.Phone?.phone_number || ''
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
        if (maintenance.StartDate) await googleSync.syncMaintenance(maintenance);
      }
    }
  } catch (error) {
    console.error('Daily sync error:', error);
  }
}

// Schedule daily sync at 2 AM
cron.schedule('0 2 * * *', performDailySync);

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    notionKey: process.env.NOTION_KEY ? 'Present' : 'Missing',
    features: FEATURES
  });
});

app.post('/api/databases/:id/query', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const cacheKey = `db_${id}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  try {
    const response = await notion.databases.query({ database_id: id });
    cache.put(cacheKey, response, CACHE_DURATION);
    res.json(response);
  } catch (error) {
    console.error(`BACKEND: Notion DB query failed - ID: ${id}, Error: ${error.message}`);
    res.status(error.status || 500).json({ error: error.message });
  }
});

app.post('/api/pages', authenticateToken, async (req, res) => {
  try {
    const response = await notion.pages.create(req.body);
    
    invalidateCache(`db_${req.body.parent.database_id}`);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.pages.update({
      page_id: id,
      ...req.body
    });
    
    invalidateCache('db_');
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post('/api/sync-now', authenticateToken, async (req, res) => {
  await performDailySync();
  invalidateCache();
  res.json({ success: true, message: 'Sync completed' });
});

app.post('/api/cache/clear', authenticateToken, (req, res) => {
  invalidateCache();
  res.json({ success: true, message: 'Cache cleared' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});