/* THE VACATION SCHEDULE - every date on the site comes from this one file.
   The trip start/end, the calendar, the week view, meals and map "related events" are all built from it.
   To change the dates of the trip, change the `date:` of each day below. Nothing else needs touching.

   One block per day, in order, with NO gaps (days with nothing planned still get a block: events: []).
   The weekday (Sat, Sun...) is worked out automatically, so it can never be wrong.
   After editing, open index.html#/check - it lists any mistakes in plain English.

   DAY fields
     date:   'YYYY-MM-DD'
     title:  optional headline for the day, e.g. 'Arrival Day'
     dinner: optional. false = no dinner expected that day (e.g. departure day).
             Text = shown instead of "not planned yet", e.g. 'Each family on their own'.
   EVENT fields
     title:       required
     time:        '6:00 PM' (use this exact style so events sort correctly). Text like 'Sunset' also works but sorts last.
     category:    plan | meal | excursion | beach | arrival | departure
     status:      'confirmed' (default) or 'tentative'   <- change to 'confirmed' when plans firm up
     location:    an id from houses.js or locations.js. Meals default to the host family's house.
     host:        a family id from families.js
     mealType:    meals only: breakfast | lunch | dinner | seafood boil | cookout | celebration | gathering
                  (a meal at 3 PM or later counts as a dinner on the home page)
     description, notes: optional text
     id:          optional short name for the event. */
FOX.schedule = [
  {
    date: '2027-06-19', title: 'Arrival Day',
    events: [
      { id: 'arrival', title: 'Check in', time: '4:00 PM', category: 'arrival', location: 'fox-house', host: 'grandparents', description: 'Houses open at 4. Stop by Island Market for groceries.' },
      { id: 'welcome-pizza', title: 'Welcome Pizza Night', time: '6:30 PM', category: 'meal', mealType: 'dinner', location: 'fox-house', host: 'grandparents', description: 'Casual dinner to kick off the week.' }
    ]
  },
  {
    date: '2027-06-20',
    events: [
      { id: 'pancakes', title: 'Pancake Breakfast', time: '8:00 AM', category: 'meal', mealType: 'breakfast', location: 'pelican-cottage', host: 'ben-sarah', description: 'Pancakes and bacon.' },
      { id: 'beach-morning', title: 'Beach Morning', time: '9:00 AM', category: 'beach', location: 'public-beach', description: 'Bring chairs, sunscreen, and shovels.' }
    ]
  },
  {
    date: '2027-06-21',
    events: [
      { id: 'cookout', title: 'Cookout & Burgers', time: '5:30 PM', category: 'meal', mealType: 'cookout', location: 'seagull-shores', host: 'amy-tom', description: 'Burgers on the grill, pool time before.' }
    ]
  },
  {
    date: '2027-06-22', dinner: 'Each family on their own',
    events: [
      { id: 'dolphin-cruise', title: 'Dolphin Cruise', time: '10:00 AM', category: 'excursion', status: 'tentative', location: 'marina', description: 'Arrive 30 minutes early.', notes: 'Weather dependent. Final call by 8 AM.' }
    ]
  },
  {
    date: '2027-06-23',
    events: [
      { id: 'fishing', title: 'Fishing at the Pier', time: '8:00 AM', category: 'excursion', status: 'tentative', location: 'fishing-pier', description: 'Bait provided.' },
      { id: 'seafood-boil', title: 'Seafood Boil', time: '6:00 PM', category: 'meal', mealType: 'seafood boil', location: 'fox-house', host: 'grandparents', description: 'Shrimp, crab, corn, potatoes, sausage.', notes: 'Bring a dessert to share.' }
    ]
  },
  {
    date: '2027-06-24',
    events: [
      { id: 'anniversary', title: 'Anniversary Celebration Dinner', time: '6:00 PM', category: 'meal', mealType: 'celebration', status: 'tentative', location: 'islander-grill', host: 'ben-sarah', description: 'Dinner out for Grandma & Grandpa.' },
      { id: 'group-photo', title: 'Group Family Photo', time: '7:30 PM', category: 'beach', status: 'tentative', location: 'west-end-beach', description: 'Sunset photo. Wear light blues and whites.' }
    ]
  },
  {
    date: '2027-06-25',
    events: [
      { id: 'oysters', title: 'Oysters on the Water', time: '12:30 PM', category: 'meal', mealType: 'gathering', location: 'dockside-oysters', host: 'amy-tom', description: 'Lunch for whoever wants to join.' }
    ]
  },
  {
    date: '2027-06-26', title: 'Departure Day', dinner: false,
    events: [
      { id: 'departure', title: 'Check out', time: '10:00 AM', category: 'departure', location: 'fox-house', description: 'Checkout by 10 AM. Strip beds, run dishwasher, take out trash.' }
    ]
  }
];
