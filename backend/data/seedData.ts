export interface SeedGroup {
  name: string;
  description: string;
  imageFile: string;
}

export interface SeedType {
  groupName: string;
  name: string;
  description: string;
  imageFile: string;
}

export interface SeedAsset {
  typeName: string;
  name: string;
  status: string;
  rentedByUserId?: string;
  returnDate?: string;
}

export const SEED_GROUPS: SeedGroup[] = [
  { 
    name: 'Laptops', 
    description: 'High-performance portable computers for work and creative tasks.',
    imageFile: 'group_laptops.jpg'
  },
  { 
    name: 'Projectors', 
    description: 'Visual projection equipment for presentations, movies, and events.',
    imageFile: 'group_projectors.jpg'
  },
  { 
    name: 'Cameras', 
    description: 'Professional digital cameras and accessories for photography and videography.',
    imageFile: 'group_cameras.jpg'
  },
  { 
    name: 'Audio', 
    description: 'High-quality sound recording and playback equipment.',
    imageFile: 'group_audio.jpg'
  },
  { 
    name: 'Lighting', 
    description: 'Professional lighting solutions for studio and location shoots.',
    imageFile: 'group_lighting.jpg'
  },
  { 
    name: 'Networking', 
    description: 'Reliable networking hardware for seamless connectivity.',
    imageFile: 'group_networking.jpg'
  },
];

export const SEED_TYPES: SeedType[] = [
  { 
    groupName: 'Laptops',    
    name: 'MacBook Air M2', 
    description: 'Apple M2 chip with 8-core CPU and 10-core GPU, 13.6-inch Liquid Retina display.',
    imageFile: 'type_macbook_air_m2.jpg'
  },
  { 
    groupName: 'Laptops',    
    name: 'Dell XPS 15', 
    description: 'High-performance laptop with 15.6-inch 4K OLED display and NVIDIA GeForce RTX graphics.',
    imageFile: 'type_dell_xps_15.jpg'
  },
  { 
    groupName: 'Laptops',    
    name: 'Lenovo ThinkPad X1 Carbon', 
    description: 'Premium business laptop featuring a lightweight carbon-fiber chassis and legendary durability.',
    imageFile: 'type_lenovo_thinkpad_x1_carbon.jpg'
  },
  { 
    groupName: 'Laptops',    
    name: 'Microsoft Surface Pro 9', 
    description: 'Versatile 2-in-1 tablet and laptop with a 13-inch touchscreen and adjustable kickstand.',
    imageFile: 'type_microsoft_surface_pro_9.jpg'
  },
  { 
    groupName: 'Projectors', 
    name: 'Epson 4K Projector', 
    description: 'Home theater projector with 4K PRO-UHD resolution and high brightness for vivid images.',
    imageFile: 'type_epson_4k_projector.jpg'
  },
  { 
    groupName: 'Projectors', 
    name: 'BenQ Short Throw', 
    description: 'Short-throw projector ideal for small spaces, delivering large images from a short distance.',
    imageFile: 'type_benq_short_throw.jpg'
  },
  { 
    groupName: 'Cameras',    
    name: 'Sony A7III Camera', 
    description: 'Full-frame mirrorless camera with advanced autofocus and 4K video capabilities.',
    imageFile: 'type_sony_a7iii_camera.jpg'
  },
  { 
    groupName: 'Cameras',    
    name: 'Canon EOS R6', 
    description: 'Versatile mirrorless camera with high-speed continuous shooting and excellent low-light performance.',
    imageFile: 'type_canon_eos_r6.jpg'
  },
  { 
    groupName: 'Cameras',    
    name: 'GoPro Hero 12', 
    description: 'Rugged action camera with HyperSmooth 6.0 stabilization and waterproof design.',
    imageFile: 'type_gopro_hero_12.jpg'
  },
  { 
    groupName: 'Audio',      
    name: 'Rode Wireless GO II', 
    description: 'Compact wireless microphone system with dual-channel recording and universal compatibility.',
    imageFile: 'type_rode_wireless_go_ii.jpg'
  },
  { 
    groupName: 'Audio',      
    name: 'Zoom H6 Recorder', 
    description: 'Portable multi-track recorder with interchangeable microphone capsules for professional audio.',
    imageFile: 'type_zoom_h6_recorder.jpg'
  },
  { 
    groupName: 'Audio',      
    name: 'Sennheiser HD 660S Headphones', 
    description: 'Open-back dynamic headphones designed for critical listening and audiophile performance.',
    imageFile: 'type_sennheiser_hd_660s_headphones.jpg'
  },
  { 
    groupName: 'Lighting',   
    name: 'Elgato Key Light Air', 
    description: 'App-controlled LED panel with flicker-free illumination and adjustable color temperature.',
    imageFile: 'type_elgato_key_light_air.jpg'
  },
  { 
    groupName: 'Lighting',   
    name: 'Aputure 120D II', 
    description: 'Professional-grade COB LED light with high color accuracy and versatile light shaping options.',
    imageFile: 'type_aputure_120d_ii.jpg'
  },
  { 
    groupName: 'Networking', 
    name: 'TP-Link Wi-Fi 6 Router', 
    description: 'Next-gen Wi-Fi 6 router with high speeds and increased capacity for multiple devices.',
    imageFile: 'type_tp-link_wi-fi_6_router.jpg'
  },
  { 
    groupName: 'Networking', 
    name: 'Cisco 8-Port Managed Switch', 
    description: 'Reliable managed switch with 8 Gigabit Ethernet ports for secure network expansion.',
    imageFile: 'type_cisco_8-port_managed_switch.jpg'
  },
];

export const SEED_ASSETS: SeedAsset[] = [
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
