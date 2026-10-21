/* SITE SETTINGS - names, text and map defaults.
   Trip DATES are NOT here: they come from the days listed in schedule.js. */
window.FOX = window.FOX || {};
FOX.config = {
  title: 'Fox Family Dauphin Island',   // site name; the year is added automatically
  year: 2027,                           // every date in schedule.js must be in this year
  timezone: 'America/Chicago',          // Dauphin Island time; decides what "today" means
  welcome: 'Welcome, Fox Family!',
  tagline: 'Everything for the week in one place.',
  weather: { lat: 30.2552, lng: -88.1097 },
  map: { lat: 30.2495, lng: -88.115, zoom: 12 },
  lastUpdated: '2027-06-17'             // YYYY-MM-DD of your latest edit; shown in the footer (optional)
};
