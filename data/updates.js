/* LATEST UPDATES - newest first. Add a new line at the TOP of the list.
   text:       what changed
   date:       when you posted it (YYYY-MM-DD)
   important:  true = shown in bold with a warning sign (optional)
   until:      last day to show it, YYYY-MM-DD (optional - hides automatically)
   event:      id of an event in schedule.js (optional). The banner then shows that event's CURRENT
               day, time and place automatically, so the banner can never disagree with the schedule.
               Write the text as the change only, e.g. 'Moved to Fox House.'
   show:       false hides it without deleting (optional) */
FOX.updates = [
  { date: '2027-06-17', text: 'Sample update: Seafood boil is now at Fox House.', event: 'seafood-boil', important: true },
  { date: '2027-06-16', text: 'Sample update: Dolphin cruise is tentative, final call by 8 AM that morning.', until: '2027-06-22' }
];
