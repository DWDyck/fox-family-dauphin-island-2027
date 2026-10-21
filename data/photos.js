/* PHOTO GALLERY
   1. Copy photos into the images/ folder (resize big phone photos to ~1600px wide first).
   2. Add a line below.
   album must match a name in the albums list. featured:true shows on the home page.
   favorite:true also shows on the Memories page.
   date (optional, YYYY-MM-DD) must be a real date; #/check validates it. */
FOX.albums = ['Beach Days', 'Family Dinners', 'Fishing Trips', 'Group Photos', 'Kids & Grandkids', 'Favorite Moments'];

FOX.photos = [
  { src: 'images/sample-sunset.svg', caption: 'Sample: replace with your featured family photo', album: 'Group Photos', featured: true },
  { src: 'images/sample-beach.svg', caption: 'Sample beach photo', album: 'Beach Days' },
  { src: 'images/sample-dinner.svg', caption: 'Sample dinner photo', album: 'Family Dinners' }
];
