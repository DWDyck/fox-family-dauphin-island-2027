/* PHOTOS & MEMORIES
   1. Copy photos into the images/ folder (resize big phone photos to ~1600px wide first).
   2. Add a line below.
   album: must match a name in the albums list.
   year: optional, e.g. 2025. Leave it out for this year's trip. Older years appear under "Past vacations".
   favorite: true shows the photo in "Family highlights".
   date: optional YYYY-MM-DD, must be a real date; #/check validates it (this year's photos only). */
FOX.albums = ['Beach Days', 'Family Dinners', 'Fishing Trips', 'Group Photos', 'Kids & Grandkids', 'Favorite Moments'];

FOX.photos = [
  { src: 'images/sample-sunset.svg', caption: 'Sample: replace with your own family photo', album: 'Group Photos', favorite: true },
  { src: 'images/sample-beach.svg', caption: 'Sample beach photo', album: 'Beach Days' },
  { src: 'images/sample-dinner.svg', caption: 'Sample dinner photo', album: 'Family Dinners' },
  { src: 'images/sample-sunset.svg', caption: 'Sample: sunset from the deck', album: 'Favorite Moments', year: 2026 },
  { src: 'images/sample-beach.svg', caption: 'Sample: first beach day', album: 'Beach Days', year: 2026 }
];
