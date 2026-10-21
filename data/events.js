/* VACATION EVENTS - one line per event. Order does not matter (the site sorts by date).
   id:        unique short name
   date:      YYYY-MM-DD
   time:      free text like '6:00 PM'
   category:  plan | meal | excursion | beach | arrival | departure
   status:    'confirmed' or 'tentative'   <- change to 'confirmed' when plans firm up
   location:  an id from locations.js or houses.js (optional)
   host:      a family id from families.js (optional)
   mealType:  only for meals: breakfast | dinner | seafood boil | cookout | celebration | gathering
   description, notes: optional text */
FOX.events = [
  { id: 'arrival', title: 'Arrival Day - Check in', date: '2027-06-12', time: '4:00 PM', category: 'arrival', status: 'confirmed', location: 'fox-house', host: 'grandparents', description: 'Houses open at 4. Stop by Island Market for groceries.' },
  { id: 'welcome-pizza', title: 'Welcome Pizza Night', date: '2027-06-12', time: '6:30 PM', category: 'meal', mealType: 'dinner', status: 'confirmed', location: 'fox-house', host: 'grandparents', description: 'Casual dinner to kick off the week.' },
  { id: 'pancakes', title: 'Pancake Breakfast', date: '2027-06-13', time: '8:00 AM', category: 'meal', mealType: 'breakfast', status: 'confirmed', location: 'pelican-cottage', host: 'ben-sarah', description: 'Pancakes and bacon.' },
  { id: 'beach-morning', title: 'Beach Morning', date: '2027-06-13', time: '9:00 AM', category: 'beach', status: 'confirmed', location: 'public-beach', description: 'Bring chairs, sunscreen, and shovels.' },
  { id: 'cookout', title: 'Cookout & Burgers', date: '2027-06-14', time: '5:30 PM', category: 'meal', mealType: 'cookout', status: 'confirmed', location: 'seagull-shores', host: 'amy-tom', description: 'Burgers on the grill, pool time before.' },
  { id: 'dolphin-cruise', title: 'Dolphin Cruise', date: '2027-06-15', time: '10:00 AM', category: 'excursion', status: 'tentative', location: 'marina', description: 'Arrive 30 minutes early.', notes: 'Weather dependent. Final call by 8 AM.' },
  { id: 'fishing', title: 'Fishing at the Pier', date: '2027-06-16', time: '8:00 AM', category: 'excursion', status: 'tentative', location: 'fishing-pier', description: 'Bait provided.' },
  { id: 'seafood-boil', title: 'Seafood Boil', date: '2027-06-16', time: '6:00 PM', category: 'meal', mealType: 'seafood boil', status: 'confirmed', location: 'fox-house', host: 'grandparents', description: 'Shrimp, crab, corn, potatoes, sausage.', notes: 'Bring a dessert to share.' },
  { id: 'anniversary', title: 'Anniversary Celebration Dinner', date: '2027-06-17', time: '6:00 PM', category: 'meal', mealType: 'celebration', status: 'tentative', location: 'islander-grill', host: 'ben-sarah', description: 'Dinner out for Grandma & Grandpa.' },
  { id: 'group-photo', title: 'Group Family Photo', date: '2027-06-17', time: '7:30 PM', category: 'beach', status: 'tentative', location: 'west-end-beach', description: 'Sunset photo. Wear light blues and whites.' },
  { id: 'oysters', title: 'Oysters on the Water', date: '2027-06-18', time: '12:30 PM', category: 'meal', mealType: 'gathering', status: 'confirmed', location: 'dockside-oysters', description: 'Lunch for whoever wants to join.' },
  { id: 'departure', title: 'Departure Day - Check out', date: '2027-06-19', time: '10:00 AM', category: 'departure', status: 'confirmed', location: 'fox-house', description: 'Checkout by 10 AM. Strip beds, run dishwasher, take out trash.' }
];
