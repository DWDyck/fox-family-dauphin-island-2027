/* RENTAL HOUSES - all names, addresses and codes here are SAMPLES. Replace with real info.
   Each house automatically appears on the map (lat/lng) and on the House Info page.
   id: short lowercase name with no spaces. Families and events point to it. */
FOX.houses = [
  {
    id: 'fox-house', name: 'Fox House', address: '100 Sample Ln, Dauphin Island, AL',
    lat: 30.2481, lng: -88.1220,
    description: 'Main family house. Gathering spot for most dinners.',
    wifiName: 'FoxHouse-Guest', wifiPassword: 'sample-pass-1',
    doorCode: '1234#', gateCode: '5678',
    parking: 'Up to 4 cars in the drive. Overflow on the street side only.',
    manager: { name: 'Island Rentals', phone: '251-555-0101' },
    notes: 'Trash pickup Tuesday. Outdoor shower by the back deck.'
  },
  {
    id: 'pelican-cottage', name: 'Pelican Cottage', address: '200 Sample Ave, Dauphin Island, AL',
    lat: 30.2495, lng: -88.1015,
    description: 'Short walk to the beach.',
    wifiName: 'Pelican', wifiPassword: 'sample-pass-2',
    doorCode: '2468#', gateCode: '',
    parking: '2 cars under the house.',
    manager: { name: 'Gulf Property Mgmt', phone: '251-555-0102' },
    notes: 'No shoes inside, please.'
  },
  {
    id: 'seagull-shores', name: 'Seagull Shores', address: '300 Sample Dr, Dauphin Island, AL',
    lat: 30.2468, lng: -88.1370,
    description: 'Sleeps 14. Pool and big deck.',
    wifiName: 'Seagull', wifiPassword: 'sample-pass-3',
    doorCode: '1357#', gateCode: '9012',
    parking: 'Gated lot; use gate code. 3 spaces.',
    manager: { name: 'Island Rentals', phone: '251-555-0101' },
    notes: 'Pool closes at 10 PM.'
  }
];
