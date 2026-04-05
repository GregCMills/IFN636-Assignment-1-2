const SEED_GROUPS = [
  { name: 'Laptops' },
  { name: 'Projectors' },
  { name: 'Cameras' },
  { name: 'Audio' },
  { name: 'Lighting' },
  { name: 'Networking' },
];

const SEED_TYPES = [
  { groupName: 'Laptops',    name: 'MacBook Air M2' },
  { groupName: 'Laptops',    name: 'Dell XPS 15' },
  { groupName: 'Laptops',    name: 'Lenovo ThinkPad X1 Carbon' },
  { groupName: 'Laptops',    name: 'Microsoft Surface Pro 9' },
  { groupName: 'Projectors', name: 'Epson 4K Projector' },
  { groupName: 'Projectors', name: 'BenQ Short Throw' },
  { groupName: 'Cameras',    name: 'Sony A7III Camera' },
  { groupName: 'Cameras',    name: 'Canon EOS R6' },
  { groupName: 'Cameras',    name: 'GoPro Hero 12' },
  { groupName: 'Audio',      name: 'Rode Wireless GO II' },
  { groupName: 'Audio',      name: 'Zoom H6 Recorder' },
  { groupName: 'Audio',      name: 'Sennheiser HD 660S Headphones' },
  { groupName: 'Lighting',   name: 'Elgato Key Light Air' },
  { groupName: 'Lighting',   name: 'Aputure 120D II' },
  { groupName: 'Networking', name: 'TP-Link Wi-Fi 6 Router' },
  { groupName: 'Networking', name: 'Cisco 8-Port Managed Switch' },
];

const SEED_ASSETS = [
  // MacBook Air M2
  { typeName: 'MacBook Air M2',              name: 'Unit 001',  status: 'Available' },
  { typeName: 'MacBook Air M2',              name: 'Unit 002',  status: 'Available' },
  { typeName: 'MacBook Air M2',              name: 'Unit 003',  status: 'Available' },
  { typeName: 'MacBook Air M2',              name: 'Unit 004',  status: 'Rented',         rentedByUserId: 'bob@mail.com',   returnDate: '2026-04-20' },
  { typeName: 'MacBook Air M2',              name: 'Unit 005',  status: 'Rented',         rentedByUserId: 'john@mail.com',  returnDate: '2026-04-25' },
  { typeName: 'MacBook Air M2',              name: 'Unit 006',  status: 'Pending Rental', rentedByUserId: 'priya@mail.com', returnDate: '2026-04-30' },
  { typeName: 'MacBook Air M2',              name: 'Unit 007',  status: 'Maintenance' },
  // Dell XPS 15
  { typeName: 'Dell XPS 15',                 name: 'Unit 001',  status: 'Available' },
  { typeName: 'Dell XPS 15',                 name: 'Unit 002',  status: 'Available' },
  { typeName: 'Dell XPS 15',                 name: 'Unit 003',  status: 'Rented',         rentedByUserId: 'marco@mail.com', returnDate: '2026-05-01' },
  { typeName: 'Dell XPS 15',                 name: 'Unit 004',  status: 'Pending Return', rentedByUserId: 'bob@mail.com',   returnDate: '2026-03-28' },
  // Lenovo ThinkPad X1 Carbon
  { typeName: 'Lenovo ThinkPad X1 Carbon',   name: 'Unit 001',  status: 'Available' },
  { typeName: 'Lenovo ThinkPad X1 Carbon',   name: 'Unit 002',  status: 'Rented',         rentedByUserId: 'john@mail.com',  returnDate: '2026-04-18' },
  { typeName: 'Lenovo ThinkPad X1 Carbon',   name: 'Unit 003',  status: 'Maintenance' },
  // Microsoft Surface Pro 9
  { typeName: 'Microsoft Surface Pro 9',     name: 'Unit 001',  status: 'Available' },
  { typeName: 'Microsoft Surface Pro 9',     name: 'Unit 002',  status: 'Pending Rental', rentedByUserId: 'marco@mail.com', returnDate: '2026-05-05' },
  // Epson 4K Projector
  { typeName: 'Epson 4K Projector',          name: 'Unit 001',  status: 'Available' },
  { typeName: 'Epson 4K Projector',          name: 'Unit 002',  status: 'Pending Rental', rentedByUserId: 'john@mail.com',  returnDate: '2026-04-12' },
  { typeName: 'Epson 4K Projector',          name: 'Unit 003',  status: 'Maintenance' },
  { typeName: 'Epson 4K Projector',          name: 'Unit 004',  status: 'Rented',         rentedByUserId: 'priya@mail.com', returnDate: '2026-04-22' },
  // BenQ Short Throw
  { typeName: 'BenQ Short Throw',            name: 'Unit 001',  status: 'Available' },
  { typeName: 'BenQ Short Throw',            name: 'Unit 002',  status: 'Pending Return', rentedByUserId: 'marco@mail.com', returnDate: '2026-03-25' },
  // Sony A7III Camera
  { typeName: 'Sony A7III Camera',           name: 'Unit 001',  status: 'Available' },
  { typeName: 'Sony A7III Camera',           name: 'Unit 002',  status: 'Available' },
  { typeName: 'Sony A7III Camera',           name: 'Unit 003',  status: 'Rented',         rentedByUserId: 'bob@mail.com',   returnDate: '2026-04-19' },
  { typeName: 'Sony A7III Camera',           name: 'Unit 004',  status: 'Pending Return', rentedByUserId: 'john@mail.com',  returnDate: '2026-03-22' },
  { typeName: 'Sony A7III Camera',           name: 'Unit 005',  status: 'Maintenance' },
  // Canon EOS R6
  { typeName: 'Canon EOS R6',                name: 'Unit 001',  status: 'Available' },
  { typeName: 'Canon EOS R6',                name: 'Unit 002',  status: 'Rented',         rentedByUserId: 'priya@mail.com', returnDate: '2026-04-28' },
  { typeName: 'Canon EOS R6',                name: 'Unit 003',  status: 'Pending Rental', rentedByUserId: 'marco@mail.com', returnDate: '2026-05-10' },
  // GoPro Hero 12
  { typeName: 'GoPro Hero 12',               name: 'Unit 001',  status: 'Available' },
  { typeName: 'GoPro Hero 12',               name: 'Unit 002',  status: 'Available' },
  { typeName: 'GoPro Hero 12',               name: 'Unit 003',  status: 'Available' },
  { typeName: 'GoPro Hero 12',               name: 'Unit 004',  status: 'Maintenance' },
  // Rode Wireless GO II
  { typeName: 'Rode Wireless GO II',         name: 'Set 001',   status: 'Available' },
  { typeName: 'Rode Wireless GO II',         name: 'Set 002',   status: 'Available' },
  { typeName: 'Rode Wireless GO II',         name: 'Set 003',   status: 'Rented',         rentedByUserId: 'bob@mail.com',   returnDate: '2026-04-15' },
  { typeName: 'Rode Wireless GO II',         name: 'Set 004',   status: 'Pending Return', rentedByUserId: 'john@mail.com',  returnDate: '2026-03-30' },
  // Zoom H6 Recorder
  { typeName: 'Zoom H6 Recorder',            name: 'Unit 001',  status: 'Available' },
  { typeName: 'Zoom H6 Recorder',            name: 'Unit 002',  status: 'Rented',         rentedByUserId: 'marco@mail.com', returnDate: '2026-04-17' },
  { typeName: 'Zoom H6 Recorder',            name: 'Unit 003',  status: 'Maintenance' },
  // Sennheiser HD 660S Headphones
  { typeName: 'Sennheiser HD 660S Headphones', name: 'Pair 001', status: 'Available' },
  { typeName: 'Sennheiser HD 660S Headphones', name: 'Pair 002', status: 'Available' },
  { typeName: 'Sennheiser HD 660S Headphones', name: 'Pair 003', status: 'Pending Rental', rentedByUserId: 'priya@mail.com', returnDate: '2026-04-22' },
  // Elgato Key Light Air
  { typeName: 'Elgato Key Light Air',        name: 'Unit 001',  status: 'Available' },
  { typeName: 'Elgato Key Light Air',        name: 'Unit 002',  status: 'Available' },
  { typeName: 'Elgato Key Light Air',        name: 'Unit 003',  status: 'Rented',         rentedByUserId: 'john@mail.com',  returnDate: '2026-04-23' },
  { typeName: 'Elgato Key Light Air',        name: 'Unit 004',  status: 'Maintenance' },
  // Aputure 120D II
  { typeName: 'Aputure 120D II',             name: 'Unit 001',  status: 'Available' },
  { typeName: 'Aputure 120D II',             name: 'Unit 002',  status: 'Pending Rental', rentedByUserId: 'bob@mail.com',   returnDate: '2026-05-02' },
  { typeName: 'Aputure 120D II',             name: 'Unit 003',  status: 'Rented',         rentedByUserId: 'priya@mail.com', returnDate: '2026-04-26' },
  // TP-Link Wi-Fi 6 Router
  { typeName: 'TP-Link Wi-Fi 6 Router',      name: 'Unit 001',  status: 'Available' },
  { typeName: 'TP-Link Wi-Fi 6 Router',      name: 'Unit 002',  status: 'Available' },
  { typeName: 'TP-Link Wi-Fi 6 Router',      name: 'Unit 003',  status: 'Rented',         rentedByUserId: 'marco@mail.com', returnDate: '2026-04-21' },
  { typeName: 'TP-Link Wi-Fi 6 Router',      name: 'Unit 004',  status: 'Pending Return', rentedByUserId: 'john@mail.com',  returnDate: '2026-03-27' },
  // Cisco 8-Port Managed Switch
  { typeName: 'Cisco 8-Port Managed Switch', name: 'Unit 001',  status: 'Available' },
  { typeName: 'Cisco 8-Port Managed Switch', name: 'Unit 002',  status: 'Maintenance' },
  { typeName: 'Cisco 8-Port Managed Switch', name: 'Unit 003',  status: 'Rented',         rentedByUserId: 'bob@mail.com',   returnDate: '2026-04-24' },
];

module.exports = { SEED_GROUPS, SEED_TYPES, SEED_ASSETS };
