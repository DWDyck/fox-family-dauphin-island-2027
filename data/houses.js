/* RENTAL HOUSES - all names, addresses here are SAMPLES. Replace with real info.
   Each house automatically appears on the map (lat/lng) and on the House Info page.
   Do NOT put door, gate or Wi-Fi codes here: this repo is public and the site has no place for them.
   id: short lowercase name with no spaces. Families and events point to it. */
FOX.houses = [
  {
    id: 'fox-house', name: 'Fox House', address: '100 Sample Ln, Dauphin Island, AL',
    lat: 30.2481, lng: -88.1220,
    description: 'Main family house. Gathering spot for most dinners.',
    parking: 'Up to 4 cars in the drive. Overflow on the street side only.',
    manager: { name: 'Island Rentals' },
    notes: 'Trash pickup Tuesday. Outdoor shower by the back deck.'
  },
  {
    id: 'pelican-cottage', name: 'Pelican Cottage', address: '200 Sample Ave, Dauphin Island, AL',
    lat: 30.2495, lng: -88.1015,
    description: 'Short walk to the beach.',
    parking: '2 cars under the house.',
    manager: { name: 'Gulf Property Mgmt' },
    notes: 'No shoes inside, please.'
  },
  {
    id: 'seagull-shores', name: 'Seagull Shores', address: '300 Sample Dr, Dauphin Island, AL',
    lat: 30.2468, lng: -88.1370,
    description: 'Sleeps 14. Pool and big deck.',
    parking: 'Gated lot. 3 spaces.',
    manager: { name: 'Island Rentals' },
    notes: 'Pool closes at 10 PM.'
  }
];
