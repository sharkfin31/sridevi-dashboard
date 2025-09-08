// Google Calendar integration - Commented out since using Notion Calendar
// const { google } = require('googleapis');

class GoogleCalendarSync {
  constructor() {
    // this.calendar = google.calendar('v3');
    // this.auth = new google.auth.GoogleAuth({
    //   keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    //   scopes: ['https://www.googleapis.com/auth/calendar']
    // });
    // this.calendarId = process.env.GOOGLE_CALENDAR_ID;
  }

  async syncBooking(booking) {
    // Google Calendar sync disabled - using Notion Calendar instead
    console.log('Google Calendar sync disabled - using Notion Calendar');
    return;
    
    // const authClient = await this.auth.getClient();
    // 
    // // Check if event already exists
    // try {
    //   const existingEvents = await this.calendar.events.list({
    //     auth: authClient,
    //     calendarId: this.calendarId,
    //     privateExtendedProperty: `notionId=${booking.id}`
    //   });
    //   
    //   if (existingEvents.data.items.length > 0) {
    //     console.log(`⏭️ Booking ${booking.CustomerName} already exists, skipping`);
    //     return;
    //   }
    // } catch (error) {
    //   console.error('Error checking existing events:', error);
    // }
    // 
    // const event = {
    //   summary: `Booking: ${booking.CustomerName} - ${booking.Destination}`,
    //   description: `Customer: ${booking.CustomerName}\nPhone: ${booking.CustomerPhone}\nAmount: ₹${booking.Amount}`,
    //   start: { date: booking.StartDate },
    //   end: { date: booking.EndDate },
    //   extendedProperties: {
    //     private: {
    //       notionId: booking.id,
    //       type: 'booking'
    //     }
    //   }
    // };
    //
    // try {
    //   await this.calendar.events.insert({
    //     auth: authClient,
    //     calendarId: this.calendarId,
    //     resource: event
    //   });
    // } catch (error) {
    //   console.error('Error syncing booking to Google Calendar:', error);
    // }
  }

  async syncMaintenance(maintenance) {
    // Google Calendar sync disabled - using Notion Calendar instead
    console.log('Google Calendar sync disabled - using Notion Calendar');
    return;
    
    // const authClient = await this.auth.getClient();
    // 
    // // Check if event already exists
    // try {
    //   const existingEvents = await this.calendar.events.list({
    //     auth: authClient,
    //     calendarId: this.calendarId,
    //     privateExtendedProperty: `notionId=${maintenance.id}`
    //   });
    //   
    //   if (existingEvents.data.items.length > 0) {
    //     console.log(`⏭️ Maintenance ${maintenance['Service Type']} already exists, skipping`);
    //     return;
    //   }
    // } catch (error) {
    //   console.error('Error checking existing events:', error);
    // }
    // 
    // const event = {
    //   summary: `Maintenance: ${maintenance['Service Type']} - ${maintenance.Vehicle}`,
    //   description: `Type: ${maintenance['Service Type']}\nCost: ₹${maintenance.Cost}\nNotes: ${maintenance.Notes}`,
    //   start: { date: maintenance['Service Date'] },
    //   end: { date: maintenance['Service Date'] },
    //   extendedProperties: {
    //     private: {
    //       notionId: maintenance.id,
    //       type: 'maintenance'
    //     }
    //   }
    // };
    //
    // try {
    //   await this.calendar.events.insert({
    //     auth: authClient,
    //     calendarId: this.calendarId,
    //     resource: event
    //   });
    // } catch (error) {
    //   console.error('Error syncing maintenance to Google Calendar:', error);
    // }
  }
}

module.exports = GoogleCalendarSync;