
export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};


export const COURIERS = [
  'Delhivery',
  'Blue Dart',
  'DTDC Express',
  'Shadowfax',
  'Professional Couriers'
];


export const CATEGORIES_CONFIG = [
  { id: 'cat-101', name: 'Accessories', description: 'Bags, belts, scarves, and style embellishments.', status: 'Active', createdDate: '2025-01-10', updatedDate: '2025-01-10' },
  { id: 'cat-102', name: 'Footwear', description: 'Designer shoes, premium sneakers, and boots.', status: 'Active', createdDate: '2025-01-12', updatedDate: '2025-01-12' },
  { id: 'cat-103', name: 'Outerwear', description: 'Coats, leather jackets, and winter clothing.', status: 'Active', createdDate: '2025-01-15', updatedDate: '2025-02-20' },
  { id: 'cat-104', name: 'Tops', description: 'Shirts, t-shirts, knitted sweaters, and blouses.', status: 'Active', createdDate: '2025-01-20', updatedDate: '2025-01-20' },
  { id: 'cat-105', name: 'Bottoms', description: 'Chinos, denim jeans, trousers, and skirts.', status: 'Active', createdDate: '2025-01-22', updatedDate: '2025-01-22' },
  { id: 'cat-106', name: 'Swimwear', description: 'Summer beachwear and swim accessories.', status: 'Disabled', createdDate: '2025-05-01', updatedDate: '2025-05-15' }
];


export const PRODUCTS_CONFIG = [
  {
    id: 'prd-8201',
    name: 'Elegant Silk Pashmina Scarf',
    sku: 'ACC-SLK-01',
    category: 'Accessories',
    price: 9999,
    cost: 3500,
    stock: 45,
    reserved: 5,
    reorderLevel: 15,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200',
    description: 'A luxurious scarf made of 100% pure Banarasi silk, featuring a sophisticated pattern that pairs perfectly with casual or business ensembles.',
    variants: [
      { size: 'One Size', color: 'Ivory Gold', stock: 20 },
      { size: 'One Size', color: 'Midnight Blue', stock: 25 }
    ],
    createdDate: '2025-02-15',
    updatedDate: '2025-06-10',
    seoTitle: 'Elegant Silk Pashmina Scarf | Premium Accessories',
    seoDescription: 'Shop our luxury 100% pure silk scarf with premium detailing. Perfect fashion accessory for all seasons.'
  },
  {
    id: 'prd-8202',
    name: 'Vintage Denim Jacket',
    sku: 'OUT-DNM-02',
    category: 'Outerwear',
    price: 22999,
    cost: 9000,
    stock: 8,
    reserved: 0,
    reorderLevel: 10,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=200',
    description: 'Distressed vintage wash denim jacket made from heavy-duty organic cotton. Features classic button closures and chest pockets.',
    variants: [
      { size: 'S', color: 'Light Blue', stock: 2 },
      { size: 'M', color: 'Light Blue', stock: 3 },
      { size: 'L', color: 'Light Blue', stock: 3 }
    ],
    createdDate: '2025-02-18',
    updatedDate: '2025-06-15',
    seoTitle: 'Vintage Wash Denim Jacket - Organic Cotton Outerwear',
    seoDescription: 'Explore our classic vintage denim jacket. Sustainably made from organic heavy wash denim.'
  },
  {
    id: 'prd-8203',
    name: 'Classic Trench Coat',
    sku: 'OUT-TRN-03',
    category: 'Outerwear',
    price: 35999,
    cost: 14000,
    stock: 22,
    reserved: 2,
    reorderLevel: 5,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=200',
    description: 'Double-breasted trench coat with adjustable waist belt. Made of water-resistant gabardine cotton, perfect for seasonal transitions.',
    variants: [
      { size: 'S', color: 'Khaki Beige', stock: 5 },
      { size: 'M', color: 'Khaki Beige', stock: 10 },
      { size: 'L', color: 'Khaki Beige', stock: 7 }
    ],
    createdDate: '2025-02-22',
    updatedDate: '2025-02-22',
    seoTitle: 'Double-Breasted Classic Trench Coat | Weather-Resistant',
    seoDescription: 'Discover our waterproof classic gabardine trench coat. Available in premium khaki beige.'
  },
  {
    id: 'prd-8204',
    name: 'Slim Fit Chino Pants',
    sku: 'BTM-CHN-04',
    category: 'Bottoms',
    price: 11999,
    cost: 4000,
    stock: 70,
    reserved: 12,
    reorderLevel: 20,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=200',
    description: 'Tailored slim-fit chinos crafted from stretch cotton twill for flexible, day-long comfort. Styled with side slip pockets and button-through rear pockets.',
    variants: [
      { size: '30', color: 'Navy', stock: 25 },
      { size: '32', color: 'Navy', stock: 25 },
      { size: '34', color: 'Navy', stock: 20 }
    ],
    createdDate: '2025-03-01',
    updatedDate: '2025-03-01',
    seoTitle: 'Slim Fit Twill Chinos | Stretch Cotton Trousers',
    seoDescription: 'Tailored comfortable twill chinos for everyday wear. Stretch-woven cotton blend.'
  },
  {
    id: 'prd-8205',
    name: 'Designer Leather Sneakers',
    sku: 'FTW-LSN-05',
    category: 'Footwear',
    price: 28999,
    cost: 11000,
    stock: 3,
    reserved: 1,
    reorderLevel: 5,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200',
    description: 'Minimalist low-top sneakers in full-grain Italian leather. Finished with custom rubber cupsoles and padded collars.',
    variants: [
      { size: '40', color: 'Minimal White', stock: 1 },
      { size: '42', color: 'Minimal White', stock: 2 }
    ],
    createdDate: '2025-03-05',
    updatedDate: '2025-06-22',
    seoTitle: 'Minimalist Italian Leather Sneakers | Designer Footwear',
    seoDescription: 'Shop full grain leather low top sneakers made in Italy. Features custom-stitched rubber cup soles.'
  },
  {
    id: 'prd-8206',
    name: 'Striped Cotton T-Shirt',
    sku: 'TOP-TSH-06',
    category: 'Tops',
    price: 4999,
    cost: 1500,
    stock: 0,
    reserved: 0,
    reorderLevel: 15,
    status: 'Draft',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200',
    description: 'Crewneck tee made from breathable combed cotton jersey. Accented with nautical stripes and a small chest embroidery.',
    variants: [
      { size: 'S', color: 'Navy White Stripe', stock: 0 },
      { size: 'M', color: 'Navy White Stripe', stock: 0 }
    ],
    createdDate: '2025-03-10',
    updatedDate: '2025-06-18',
    seoTitle: 'Striped Combed Cotton Crewneck T-Shirt',
    seoDescription: 'Nautical-inspired striped combed cotton t-shirt with classic crewneck cut.'
  },
  {
    id: 'prd-8207',
    name: 'Knitted Wool Sweater',
    sku: 'TOP-WLS-07',
    category: 'Tops',
    price: 15999,
    cost: 6000,
    stock: 15,
    reserved: 0,
    reorderLevel: 10,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=200',
    description: 'Cozy cable-knit crewneck sweater knitted from soft merino wool. Ribbed trims on cuffs, hem, and neck to retain warmth.',
    variants: [
      { size: 'M', color: 'Forest Green', stock: 7 },
      { size: 'L', color: 'Forest Green', stock: 8 }
    ],
    createdDate: '2025-03-12',
    updatedDate: '2025-03-12',
    seoTitle: 'Merino Wool Cable-Knit Sweater | Warm Tops',
    seoDescription: 'Cozy up in our soft merino wool cable knit crewneck sweater. Finished with double rib cuffs.'
  },
  {
    id: 'prd-8208',
    name: 'Leather Belt',
    sku: 'ACC-LBT-08',
    category: 'Accessories',
    price: 6999,
    cost: 2500,
    stock: 35,
    reserved: 3,
    reorderLevel: 8,
    status: 'Live',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb8ecfbd4?auto=format&fit=crop&q=80&w=200',
    description: 'Top-grain bridle leather belt with a solid brass buckle. Hand-burnished edges for a clean, premium finish.',
    variants: [
      { size: '32', color: 'Chestnut Brown', stock: 15 },
      { size: '34', color: 'Chestnut Brown', stock: 20 }
    ],
    createdDate: '2025-03-20',
    updatedDate: '2025-03-20',
    seoTitle: 'Top-Grain Leather Belt with Solid Brass Buckle',
    seoDescription: 'Shop bridle leather chestnut brown belt with hand burnished finishing. Solid brass fittings.'
  }
];


export const PRODUCT_MOVEMENTS = [
  { id: 'mov-1', productId: 'prd-8201', productName: 'Elegant Silk Pashmina Scarf', sku: 'ACC-SLK-01', type: 'In', changeQuantity: 50, resultingQuantity: 50, timestamp: '2025-02-15T09:00:00Z', reason: 'Initial inventory load', user: 'System Admin' },
  { id: 'mov-2', productId: 'prd-8201', productName: 'Elegant Silk Pashmina Scarf', sku: 'ACC-SLK-01', type: 'Out', changeQuantity: -5, resultingQuantity: 45, timestamp: '2025-06-10T14:30:00Z', reason: 'Order fulfillment #ORD-8291-B', user: 'System Agent' },
  { id: 'mov-3', productId: 'prd-8205', productName: 'Designer Leather Sneakers', sku: 'FTW-LSN-05', type: 'In', changeQuantity: 5, resultingQuantity: 5, timestamp: '2025-03-05T10:15:00Z', reason: 'Supplier delivery batch #992', user: 'System Admin' },
  { id: 'mov-4', productId: 'prd-8205', productName: 'Designer Leather Sneakers', sku: 'FTW-LSN-05', type: 'Out', changeQuantity: -2, resultingQuantity: 3, timestamp: '2025-06-22T11:00:00Z', reason: 'Damaged item written off', user: 'Ekta Chowdary' }
];


export const PRODUCT_ACTIVITIES = [
  { id: 'act-1', productId: 'prd-8201', productName: 'Elegant Silk Pashmina Scarf', action: 'Product created and set to live', timestamp: '2025-02-15T09:00:00Z', user: 'System Admin' },
  { id: 'act-2', productId: 'prd-8201', productName: 'Elegant Silk Pashmina Scarf', action: 'Updated product price from ₹8,999 to ₹9,999', timestamp: '2025-06-10T14:30:00Z', user: 'System Admin' },
  { id: 'act-3', productId: 'prd-8206', productName: 'Striped Cotton T-Shirt', action: 'Product set to draft status', timestamp: '2025-06-18T16:00:00Z', user: 'Sneha Reddy' },
  { id: 'act-4', productId: 'prd-8205', productName: 'Designer Leather Sneakers', action: 'Inventory adjusted (-2 stock written off)', timestamp: '2025-06-22T11:00:00Z', user: 'Ekta Chowdary' }
];


export const USERS = [
  {
    id: '92831',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@gmail.com',
    phone: '+91 98123 45678',
    orders: 42,
    spent: 124500,
    status: 'Active',
    role: 'Customer',
    createdDate: 'Oct 24, 2023'
  },
  {
    id: '92834',
    name: 'Rohan Naidu',
    email: 'rohan.n@naiduenterprise.in',
    phone: '+91 99234 56789',
    orders: 128,
    spent: 541205,
    status: 'Blocked',
    role: 'Admin',
    createdDate: 'Aug 15, 2022'
  },
  {
    id: '92842',
    name: 'Priya Reddy',
    email: 'priya.reddy@yahoo.co.in',
    phone: '+91 98345 67890',
    orders: 5,
    spent: 12000,
    status: 'Pending',
    role: 'Customer',
    createdDate: 'Jan 02, 2024'
  },
  {
    id: '92845',
    name: 'Kavya Naidu',
    email: 'kavya.naidu@naiduassociates.com',
    phone: '+91 98456 78901',
    orders: 18,
    spent: 42300,
    status: 'Active',
    role: 'Customer',
    createdDate: 'Feb 10, 2024'
  },
  {
    id: '92848',
    name: 'Amit Raju',
    email: 'amit.raju@rajuconsulting.in',
    phone: '+91 98567 89012',
    orders: 34,
    spent: 98400,
    status: 'Active',
    role: 'Customer',
    createdDate: 'Mar 15, 2024'
  },
  {
    id: '92850',
    name: 'Ekta Chowdary',
    email: 'ekta.chowdary@gmail.com',
    phone: '+91 98678 90123',
    orders: 72,
    spent: 210500,
    status: 'Active',
    role: 'Super Admin',
    createdDate: 'Nov 12, 2022'
  },
  {
    id: '92855',
    name: 'Vikram Reddy',
    email: 'vikram.reddy@reddytravels.co.in',
    phone: '+91 98789 01234',
    orders: 0,
    spent: 0,
    status: 'Pending',
    role: 'Customer',
    createdDate: 'Jun 12, 2026'
  },
  {
    id: '92857',
    name: 'Rajesh Rao',
    email: 'rajesh.rao@raoretails.in',
    phone: '+91 98890 12345',
    orders: 14,
    spent: 31005,
    status: 'Blocked',
    role: 'Customer',
    createdDate: 'Dec 05, 2023'
  },
  {
    id: '92860',
    name: 'Charitha Rao',
    email: 'charitha.r@raoclinics.in',
    phone: '+91 98901 23456',
    orders: 55,
    spent: 149000,
    status: 'Active',
    role: 'Customer',
    createdDate: 'Apr 20, 2024'
  },
  {
    id: '92863',
    name: 'Nikhilesh Rao',
    email: 'nikhilesh.rao@physics.isi.edu',
    phone: '+91 99012 34567',
    orders: 11,
    spent: 24500,
    status: 'Active',
    role: 'Customer',
    createdDate: 'May 02, 2025'
  },
  {
    id: '92865',
    name: 'Sujatha Reddy',
    email: 'sujatha.r@ap.gov.in',
    phone: '+91 11 5555-0133',
    orders: 9,
    spent: 19802,
    status: 'Pending',
    role: 'Customer',
    createdDate: 'Jan 18, 2026'
  },
  {
    id: '92868',
    name: 'Rahul Varma',
    email: 'rahul.varma@varmarefrigeration.in',
    phone: '+91 99234 87654',
    orders: 67,
    spent: 182000,
    status: 'Active',
    role: 'Admin',
    createdDate: 'Jul 30, 2023'
  }
];


export const USER_ACTIVITIES = [
  { id: 'act-1', userId: '92831', userName: 'Sneha Reddy', action: 'Logged into admin panel', timestamp: '2026-06-22T16:10:00Z', ipAddress: '192.168.1.45', device: 'Chrome / Windows', status: 'Success', category: 'Auth' },
  { id: 'act-2', userId: '92834', userName: 'Rohan Naidu', action: 'Attempted login - Account Blocked', timestamp: '2026-06-22T15:34:12Z', ipAddress: '82.44.112.5', device: 'Safari / iPhone', status: 'Failed', category: 'Auth' },
  { id: 'act-3', userId: '92831', userName: 'Sneha Reddy', action: 'Updated profile description', timestamp: '2026-06-22T14:22:05Z', ipAddress: '192.168.1.45', device: 'Chrome / Windows', status: 'Success', category: 'Profile' },
  { id: 'act-4', userId: '92842', userName: 'Priya Reddy', action: 'Placed new order #ORD-8291-B', timestamp: '2026-06-22T12:05:44Z', ipAddress: '210.14.99.12', device: 'Chrome / macOS', status: 'Success', category: 'Transaction' },
  { id: 'act-5', userId: '92850', userName: 'Ekta Chowdary', action: 'Changed password security policy', timestamp: '2026-06-22T09:15:30Z', ipAddress: '95.24.120.3', device: 'Firefox / Linux', status: 'Success', category: 'Security' }
];


export const ORDERS = [
  {
    id: '8291-B',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    customerPhone: '+91 98123 45678',
    items: [
      { id: 'p1', name: 'Slim Fit Corduroy Blazer', price: 20000, quantity: 2, size: 'L', color: 'Forest Green', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=150' },
      { id: 'p2', name: 'Classic Leather Brogues', price: 75000, quantity: 1, size: '10', color: 'Mahogany Brown', image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=150' }
    ],
    totalAmount: 115000,
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    deliveryStatus: 'Pending',
    createdDate: 'Oct 24, 2023',
    shippingAddress: {
      name: 'Sneha Reddy',
      street: 'Flat 404, Maker Towers, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400021',
      country: 'India',
      phone: '+91 98123 45678'
    },
    billingAddress: {
      name: 'Sneha Reddy',
      street: 'Flat 404, Maker Towers, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400021',
      country: 'India',
      phone: '+91 98123 45678'
    },
    paymentDetails: {
      method: 'Razorpay API (NetBanking)',
      transactionId: 'pay_OMK283921820',
      date: 'Oct 24, 2023, 02:45 PM'
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order successfully created by customer.', timestamp: 'Oct 24, 2023, 02:30 PM', status: 'completed' },
      { id: 't2', title: 'Payment Confirmed', description: 'Payment of ₹1,15,000 captured successfully via Razorpay.', timestamp: 'Oct 24, 2023, 02:45 PM', status: 'completed' },
      { id: 't3', title: 'Processing Order', description: 'Items gathered and preparing for packaging.', timestamp: 'Oct 25, 2023, 09:00 AM', status: 'current' },
      { id: 't4', title: 'Shipped', description: 'Package dispatched via Delhivery Ground.', timestamp: '', status: 'upcoming' },
      { id: 't5', title: 'Delivered', description: 'Order delivered to recipient address.', timestamp: '', status: 'upcoming' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed', user: 'Customer (Web Portal)', timestamp: '2023-10-24T14:30:00Z' },
      { id: 'a2', action: 'Payment Captured (pay_OMK283921820)', user: 'Razorpay Gateway', timestamp: '2023-10-24T14:45:00Z' },
      { id: 'a3', action: 'Status changed from Pending to Processing', user: 'System (Auto Route)', timestamp: '2023-10-25T09:00:00Z' }
    ],
    notes: [
      { id: 'n1', author: 'Sneha Reddy', content: 'Please wrap carefully. This is a birthday gift.', timestamp: 'Oct 24, 2023, 02:30 PM' }
    ]
  },
  {
    id: '9021-C',
    customerName: 'Priya Reddy',
    customerEmail: 'priya.reddy@yahoo.co.in',
    customerPhone: '+91 98345 67890',
    items: [
      { id: 'p3', name: 'Ribbed Knit Midi Dress', price: 6999, quantity: 1, size: 'M', color: 'Oatmeal', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150' }
    ],
    totalAmount: 6999,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    deliveryStatus: 'Delivered',
    createdDate: 'Nov 02, 2023',
    shippingAddress: {
      name: 'Priya Reddy',
      street: '15, Connaught Place, Block H',
      city: 'New Delhi',
      state: 'Delhi',
      zip: '110001',
      country: 'India',
      phone: '+91 98345 67890'
    },
    billingAddress: {
      name: 'Priya Reddy',
      street: '15, Connaught Place, Block H',
      city: 'New Delhi',
      state: 'Delhi',
      zip: '110001',
      country: 'India',
      phone: '+91 98345 67890'
    },
    paymentDetails: {
      method: 'UPI (Google Pay / Paytm)',
      transactionId: 'upi_txn_1029384756',
      date: 'Nov 02, 2023, 10:12 AM'
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order successfully created.', timestamp: 'Nov 02, 2023, 10:05 AM', status: 'completed' },
      { id: 't2', title: 'Payment Confirmed', description: 'UPI Payment captured successfully.', timestamp: 'Nov 02, 2023, 10:12 AM', status: 'completed' },
      { id: 't3', title: 'Processing Order', description: 'Items packaged and ready for dispatch.', timestamp: 'Nov 02, 2023, 03:00 PM', status: 'completed' },
      { id: 't4', title: 'Shipped', description: 'Dispatched via Blue Dart tracking #BD8273.', timestamp: 'Nov 03, 2023, 08:30 AM', status: 'completed' },
      { id: 't5', title: 'Delivered', description: 'Delivered to front desk by Blue Dart courier.', timestamp: 'Nov 05, 2023, 04:15 PM', status: 'completed' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed', user: 'Customer', timestamp: '2023-11-02T10:05:00Z' },
      { id: 'a2', action: 'Payment Captured', user: 'UPI Gateway Integration', timestamp: '2023-11-02T10:12:00Z' },
      { id: 'a3', action: 'Order Shipped', user: 'Logistics Manager', timestamp: '2023-11-03T08:30:00Z' },
      { id: 'a4', action: 'Marked as Delivered', user: 'System (Carrier Callback)', timestamp: '2023-11-05T16:15:00Z' }
    ],
    notes: []
  },
  {
    id: '1284-F',
    customerName: 'Amit Raju',
    customerEmail: 'amit.raju@rajuconsulting.in',
    customerPhone: '+91 98567 89012',
    items: [
      { id: 'p4', name: 'Oversized Cashmere Sweater', price: 15000, quantity: 2, size: 'S', color: 'Ivory', image: 'https://images.unsplash.com/photo-1574164904299-3a102b110380?w=150' },
      { id: 'p5', name: 'High-Waisted Wide Leg Trousers', price: 10000, quantity: 1, size: '4', color: 'Beige', image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=150' },
      { id: 'p6', name: 'Suede Ankle Boots', price: 5000, quantity: 1, size: '8', color: 'Taupe', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150' }
    ],
    totalAmount: 45000,
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    deliveryStatus: 'Pending',
    createdDate: 'Dec 15, 2023',
    shippingAddress: {
      name: 'Amit Raju',
      street: '120, Residency Road, Richmond Town',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560025',
      country: 'India',
      phone: '+91 98567 89012'
    },
    billingAddress: {
      name: 'Amit Raju',
      street: '120, Residency Road, Richmond Town',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560025',
      country: 'India',
      phone: '+91 98567 89012'
    },
    paymentDetails: {
      method: 'Bank Transfer (Awaiting Verification)',
      transactionId: '',
      date: ''
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order created, awaiting bank IMPS/NEFT confirmation.', timestamp: 'Dec 15, 2023, 11:20 AM', status: 'current' },
      { id: 't2', title: 'Payment Confirmed', description: 'Awaiting bank confirmation.', timestamp: '', status: 'upcoming' },
      { id: 't3', title: 'Processing Order', description: 'Preparing items.', timestamp: '', status: 'upcoming' },
      { id: 't4', title: 'Shipped', description: 'Dispatch via Professional Couriers.', timestamp: '', status: 'upcoming' },
      { id: 't5', title: 'Delivered', description: 'Delivered at destination.', timestamp: '', status: 'upcoming' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed (Awaiting Bank Transfer)', user: 'Customer', timestamp: '2023-12-15T11:20:00Z' }
    ],
    notes: [
      { id: 'n1', author: 'Support Admin', content: 'Customer called. IMPS transaction is initiated. Verify billing ledger on Monday.', timestamp: 'Dec 16, 2023, 09:30 AM' }
    ]
  },
  {
    id: '4567-A',
    customerName: 'Rohan Naidu',
    customerEmail: 'rohan.n@naiduenterprise.in',
    customerPhone: '+91 99234 56789',
    items: [
      { id: 'p7', name: 'Wool Wrap Coat', price: 25000, quantity: 1, size: 'XL', color: 'Camel', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' }
    ],
    totalAmount: 25000,
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    deliveryStatus: 'In Transit',
    createdDate: 'Jan 10, 2024',
    shippingAddress: {
      name: 'Rohan Naidu',
      street: '88, Koregaon Park Road, Lane 5',
      city: 'Pune',
      state: 'Maharashtra',
      zip: '411001',
      country: 'India',
      phone: '+91 99234 56789'
    },
    billingAddress: {
      name: 'Rohan Naidu',
      street: '88, Koregaon Park Road, Lane 5',
      city: 'Pune',
      state: 'Maharashtra',
      zip: '411001',
      country: 'India',
      phone: '+91 99234 56789'
    },
    paymentDetails: {
      method: 'UPI (Paytm)',
      transactionId: 'upi_txn_3344556677',
      date: 'Jan 10, 2024, 05:18 PM'
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order created via Android App.', timestamp: 'Jan 10, 2024, 05:15 PM', status: 'completed' },
      { id: 't2', title: 'Payment Confirmed', description: 'UPI Payment approved successfully.', timestamp: 'Jan 10, 2024, 05:18 PM', status: 'completed' },
      { id: 't3', title: 'Processing Order', description: 'Order packaged and box sealed.', timestamp: 'Jan 11, 2024, 10:00 AM', status: 'completed' },
      { id: 't4', title: 'Shipped', description: 'Dispatched via DTDC tracking #DTDC1029.', timestamp: 'Jan 11, 2024, 02:40 PM', status: 'current' },
      { id: 't5', title: 'Delivered', description: 'Delivered to address.', timestamp: '', status: 'upcoming' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed', user: 'Customer (Android App)', timestamp: '2024-01-10T17:15:00Z' },
      { id: 'a2', action: 'Payment Captured', user: 'UPI Gateway Integration', timestamp: '2024-01-10T17:18:00Z' },
      { id: 'a3', action: 'Dispatched via DTDC', user: 'Fulfillment Center', timestamp: '2024-01-11T14:40:00Z' }
    ],
    notes: []
  },
  {
    id: '7890-X',
    customerName: 'Kavya Naidu',
    customerEmail: 'kavya.naidu@naiduassociates.com',
    customerPhone: '+91 98456 78901',
    items: [
      { id: 'p8', name: 'Silk Shirt & Camisole Set', price: 22000, quantity: 4, size: 'S', color: 'Burgundy', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150' }
    ],
    totalAmount: 88000,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    deliveryStatus: 'Delivered',
    createdDate: 'Feb 14, 2024',
    shippingAddress: {
      name: 'Kavya Naidu',
      street: '404, Maker Chambers V, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400021',
      country: 'India',
      phone: '+91 98456 78901'
    },
    billingAddress: {
      name: 'Kavya Naidu',
      street: '404, Maker Chambers V, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400021',
      country: 'India',
      phone: '+91 98456 78901'
    },
    paymentDetails: {
      method: 'Razorpay Card Checkout',
      transactionId: 'pay_9887766554',
      date: 'Feb 14, 2024, 08:30 AM'
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order created.', timestamp: 'Feb 14, 2024, 08:20 AM', status: 'completed' },
      { id: 't2', title: 'Payment Confirmed', description: 'Payment captured successfully via Razorpay.', timestamp: 'Feb 14, 2024, 08:30 AM', status: 'completed' },
      { id: 't3', title: 'Processing Order', description: 'Prepared for logistics dispatch.', timestamp: 'Feb 14, 2024, 01:00 PM', status: 'completed' },
      { id: 't4', title: 'Shipped', description: 'Shipped via Delhivery Express #DLV29102.', timestamp: 'Feb 15, 2024, 09:00 AM', status: 'completed' },
      { id: 't5', title: 'Delivered', description: 'Delivered and signed by K. Naidu.', timestamp: 'Feb 17, 2024, 02:45 PM', status: 'completed' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed', user: 'Customer', timestamp: '2024-02-14T08:20:00Z' },
      { id: 'a2', action: 'Payment Captured', user: 'Razorpay Checkout', timestamp: '2024-02-14T08:30:00Z' },
      { id: 'a3', action: 'Marked as Delivered', user: 'Delhivery Callback API', timestamp: '2024-02-17T14:45:00Z' }
    ],
    notes: []
  },
  {
    id: '1122-Y',
    customerName: 'Rahul Varma',
    customerEmail: 'rahul.varma@varmarefrigeration.in',
    customerPhone: '+91 99234 87654',
    items: [
      { id: 'p9', name: 'Organic Cotton Crew Socks (3-Pack)', price: 3500, quantity: 1, size: 'One Size', color: 'Black/Grey/White', image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=150' }
    ],
    totalAmount: 3500,
    paymentStatus: 'Failed',
    orderStatus: 'Cancelled',
    deliveryStatus: 'Cancelled',
    createdDate: 'Mar 20, 2024',
    shippingAddress: {
      name: 'Rahul Varma',
      street: '456, Lake View Enclave, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      zip: '500034',
      country: 'India',
      phone: '+91 99234 87654'
    },
    billingAddress: {
      name: 'Rahul Varma',
      street: '456, Lake View Enclave, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      zip: '500034',
      country: 'India',
      phone: '+91 99234 87654'
    },
    paymentDetails: {
      method: 'Net Banking (HDFC)',
      transactionId: 'txn_failed_9901',
      date: 'Mar 20, 2024, 04:30 PM'
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order initialized.', timestamp: 'Mar 20, 2024, 04:25 PM', status: 'completed' },
      { id: 't2', title: 'Payment Failed', description: 'Transaction declined by bank: Insufficient Funds.', timestamp: 'Mar 20, 2024, 04:30 PM', status: 'completed' },
      { id: 't3', title: 'Cancelled', description: 'Order cancelled due to transaction failure.', timestamp: 'Mar 20, 2024, 05:00 PM', status: 'completed' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed', user: 'Customer', timestamp: '2024-03-20T16:25:00Z' },
      { id: 'a2', action: 'Payment Declined: Insufficient Funds', user: 'NetBanking Portal Gateway', timestamp: '2024-03-20T16:30:00Z' },
      { id: 'a3', action: 'Order cancelled automatically', user: 'System (Failure Hook)', timestamp: '2024-03-20T17:00:00Z' }
    ],
    notes: []
  },
  {
    id: '3344-Z',
    customerName: 'Ekta Chowdary',
    customerEmail: 'ekta.chowdary@gmail.com',
    customerPhone: '+91 98678 90123',
    items: [
      { id: 'p10', name: 'Shearling Aviator Jacket', price: 185000, quantity: 1, size: 'M', color: 'Vintage Black', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150' }
    ],
    totalAmount: 185000,
    paymentStatus: 'Refunded',
    orderStatus: 'Cancelled',
    deliveryStatus: 'Cancelled',
    createdDate: 'Apr 05, 2024',
    shippingAddress: {
      name: 'Ekta Chowdary',
      street: '12, Sector 15, Vashi',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      zip: '400703',
      country: 'India',
      phone: '+91 98678 90123'
    },
    billingAddress: {
      name: 'Ekta Chowdary',
      street: '12, Sector 15, Vashi',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      zip: '400703',
      country: 'India',
      phone: '+91 98678 90123'
    },
    paymentDetails: {
      method: 'Razorpay UPI Intent',
      transactionId: 'pay_8820310283',
      date: 'Apr 05, 2024, 11:45 AM'
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order created by customer.', timestamp: 'Apr 05, 2024, 11:40 AM', status: 'completed' },
      { id: 't2', title: 'Payment Confirmed', description: 'Captured ₹1,85,000 via Razorpay.', timestamp: 'Apr 05, 2024, 11:45 AM', status: 'completed' },
      { id: 't3', title: 'Cancelled & Refunded', description: 'Order cancelled. Refund of ₹1,85,000 processed to UPI Account.', timestamp: 'Apr 06, 2024, 02:30 PM', status: 'completed' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed', user: 'Customer', timestamp: '2024-04-05T11:40:00Z' },
      { id: 'a2', action: 'Payment Captured', user: 'Razorpay Gateway', timestamp: '2024-04-05T11:45:00Z' },
      { id: 'a3', action: 'Refunded & Cancelled (Customer requested return before shipping)', user: 'Customer Service Admin', timestamp: '2024-04-06T14:30:00Z' }
    ],
    notes: [
      { id: 'n1', author: 'Customer Support', content: 'Customer requested cancellation via email. Reason: wrong item size selected. Issued full refund.', timestamp: 'Apr 06, 2024, 02:28 PM' }
    ]
  },
  {
    id: '5566-W',
    customerName: 'Charitha Rao',
    customerEmail: 'charitha.r@raoclinics.in',
    customerPhone: '+91 98901 23456',
    items: [
      { id: 'p11', name: 'Embellished Evening Gown', price: 35000, quantity: 1, size: 'S', color: 'Navy Blue', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=150' }
    ],
    totalAmount: 35000,
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    deliveryStatus: 'Pending',
    createdDate: 'May 12, 2024',
    shippingAddress: {
      name: 'Charitha Rao',
      street: 'Block 2, Rao Hospital, Ring Road',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      zip: '530026',
      country: 'India',
      phone: '+91 98901 23456'
    },
    billingAddress: {
      name: 'Charitha Rao',
      street: 'Block 2, Rao Hospital, Ring Road',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      zip: '530026',
      country: 'India',
      phone: '+91 98901 23456'
    },
    paymentDetails: {
      method: 'Razorpay UPI (Paytm App)',
      transactionId: 'pay_OMK283921820',
      date: 'May 12, 2024, 09:12 PM'
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order created.', timestamp: 'May 12, 2024, 09:05 PM', status: 'completed' },
      { id: 't2', title: 'Payment Confirmed', description: 'Captured via Razorpay UPI.', timestamp: 'May 12, 2024, 09:12 PM', status: 'completed' },
      { id: 't3', title: 'Processing Order', description: 'Quality inspection passed. Preparing for pack.', timestamp: 'May 13, 2024, 11:00 AM', status: 'current' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed', user: 'Customer', timestamp: '2024-05-12T21:05:00Z' },
      { id: 'a2', action: 'Payment Captured', user: 'Razorpay Integration', timestamp: '2024-05-12T21:12:00Z' }
    ],
    notes: []
  },
  {
    id: '7788-V',
    customerName: 'Nikhilesh Rao',
    customerEmail: 'nikhilesh.rao@physics.isi.edu',
    customerPhone: '+91 99012 34567',
    items: [
      { id: 'p12', name: 'Merino Wool Polo Shirt', price: 7500, quantity: 2, size: 'L', color: 'Navy', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150' }
    ],
    totalAmount: 15000,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    deliveryStatus: 'Delivered',
    createdDate: 'Jun 01, 2024',
    shippingAddress: {
      name: 'Nikhilesh Rao',
      street: 'Physics Dept, Indian Statistical Institute, 203 B.T. Road',
      city: 'Kolkata',
      state: 'West Bengal',
      zip: '700108',
      country: 'India',
      phone: '+91 99012 34567'
    },
    billingAddress: {
      name: 'Nikhilesh Rao',
      street: 'Physics Dept, Indian Statistical Institute, 203 B.T. Road',
      city: 'Kolkata',
      state: 'West Bengal',
      zip: '700108',
      country: 'India',
      phone: '+91 99012 34567'
    },
    paymentDetails: {
      method: 'Razorpay Card (SBI Credit Card)',
      transactionId: 'pay_9028302190',
      date: 'Jun 01, 2024, 02:15 PM'
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order created.', timestamp: 'Jun 01, 2024, 02:00 PM', status: 'completed' },
      { id: 't2', title: 'Payment Confirmed', description: 'Captured ₹15,000 SBI Card payment successfully.', timestamp: 'Jun 01, 2024, 02:15 PM', status: 'completed' },
      { id: 't3', title: 'Processing Order', description: 'Dispatched from Kolkata warehouse.', timestamp: 'Jun 02, 2024, 08:00 AM', status: 'completed' },
      { id: 't4', title: 'Shipped', description: 'Dispatched via Shadowfax Ground #SF98273.', timestamp: 'Jun 02, 2024, 11:30 AM', status: 'completed' },
      { id: 't5', title: 'Delivered', description: 'Delivered and handed over.', timestamp: 'Jun 04, 2024, 01:20 PM', status: 'completed' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed', user: 'Customer', timestamp: '2024-06-01T14:00:00Z' },
      { id: 'a2', action: 'Payment Captured', user: 'SBI Razorpay Gateway', timestamp: '2024-06-01T14:15:00Z' },
      { id: 'a3', action: 'Marked as Delivered', user: 'Shadowfax Carrier API', timestamp: '2024-06-04T13:20:00Z' }
    ],
    notes: []
  },
  {
    id: '9900-U',
    customerName: 'Sujatha Reddy',
    customerEmail: 'sujatha.r@ap.gov.in',
    customerPhone: '+91 866 555-0133',
    items: [
      { id: 'p13', name: 'Handcrafted Pashmina Shawl', price: 7999, quantity: 1, size: 'One Size', color: 'Emerald Green', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=150' }
    ],
    totalAmount: 7999,
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    deliveryStatus: 'Pending',
    createdDate: 'Jun 18, 2026',
    shippingAddress: {
      name: 'Sujatha Reddy',
      street: 'Plot 10, Sector 4, Amaravati',
      city: 'Guntur',
      state: 'Andhra Pradesh',
      zip: '522501',
      country: 'India',
      phone: '+91 866 555-0133'
    },
    billingAddress: {
      name: 'Sujatha Reddy',
      street: 'Plot 10, Sector 4, Amaravati',
      city: 'Guntur',
      state: 'Andhra Pradesh',
      zip: '522501',
      country: 'India',
      phone: '+91 866 555-0133'
    },
    paymentDetails: {
      method: 'UPI (Awaiting Authorization)',
      transactionId: '',
      date: ''
    },
    timeline: [
      { id: 't1', title: 'Order Placed', description: 'Order initialized, UPI intent request sent to customer phone.', timestamp: 'Jun 18, 2026, 10:30 AM', status: 'current' },
      { id: 't2', title: 'Payment Confirmed', description: 'Awaiting authorization response from UPI provider.', timestamp: '', status: 'upcoming' }
    ],
    activityLogs: [
      { id: 'a1', action: 'Order Placed (Awaiting UPI payment)', user: 'Customer', timestamp: '2026-06-18T10:30:00Z' }
    ],
    notes: []
  }
];


export const TRANSACTIONS = [
  {
    id: 'TXN-94281',
    orderId: 'ORD-8291-B',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    customerAvatar: 'SR',
    amount: 115000,
    tax: 20700,
    method: 'Visa',
    methodDetail: 'SBI Credit Card •••• 4242',
    status: 'SUCCESS',
    date: '2023-10-24T14:22:12',
    billingAddress: 'Flat 404, Maker Towers, Nariman Point, Mumbai, MH, 400021, IN',
    gateway: 'Razorpay Gateway',
    referenceId: 'ch_SBI8a3e7l5tO4'
  },
  {
    id: 'TXN-94280',
    orderId: 'ORD-9021-C',
    customerName: 'Priya Reddy',
    customerAvatar: 'PR',
    customerEmail: 'priya.reddy@yahoo.co.in',
    amount: 6999,
    tax: 1260,
    method: 'PayPal', 
    methodDetail: 'Google Pay upi_txn_1029384756',
    status: 'SUCCESS',
    date: '2023-10-24T12:05:00',
    billingAddress: '15, Connaught Place, Block H, New Delhi, DL, 110001, IN',
    gateway: 'Razorpay UPI',
    referenceId: 'pay_bf89ad39ce8a1'
  },
  {
    id: 'TXN-94279',
    orderId: 'ORD-1284-F',
    customerName: 'Amit Raju',
    customerAvatar: 'AR',
    customerEmail: 'amit.raju@rajuconsulting.in',
    amount: 45000,
    tax: 8100,
    method: 'Mastercard',
    methodDetail: 'HDFC Debit Card •••• 8821',
    status: 'FAILED',
    date: '2023-10-23T18:45:10',
    billingAddress: '120, Residency Road, Richmond Town, Bengaluru, KA, 560025, IN',
    gateway: 'Razorpay PG',
    referenceId: 'ch_8a2d184bf9e2c'
  },
  {
    id: 'TXN-94278',
    orderId: 'ORD-3344-Z',
    customerName: 'Ekta Chowdary',
    customerAvatar: 'EC',
    customerEmail: 'ekta.chowdary@gmail.com',
    amount: 185000,
    tax: 33300,
    method: 'Crypto (BTC)', 
    methodDetail: 'Razorpay UPI Refund Intent',
    status: 'REFUNDED',
    date: '2023-10-23T15:10:00',
    billingAddress: '12, Sector 15, Vashi, Navi Mumbai, MH, 400703, IN',
    gateway: 'Razorpay Refund',
    referenceId: 'txn_refund_239a82cd8b'
  },
  {
    id: 'TXN-94277',
    orderId: 'ORD-4567-A',
    customerName: 'Rohan Naidu',
    customerAvatar: 'RN',
    customerEmail: 'rohan.n@naiduenterprise.in',
    amount: 25000,
    tax: 4500,
    method: 'Wire',
    methodDetail: 'ICICI NetBanking •••• 9812',
    status: 'SUCCESS',
    date: '2023-10-23T11:22:45',
    billingAddress: '88, Koregaon Park Road, Lane 5, Pune, MH, 411001, IN',
    gateway: 'Direct Bank Settlement',
    referenceId: 'wire_settle_990141'
  }
];


export const INVOICES = [
  {
    number: 'INV-2023-94281',
    orderRef: '8291-B',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    amount: 115000,
    tax: 20700,
    status: 'Paid',
    date: '2023-10-24',
    items: [
      { description: 'Slim Fit Corduroy Blazer', quantity: 2, price: 20000 },
      { description: 'Classic Leather Brogues', quantity: 1, price: 75000 }
    ]
  },
  {
    number: 'INV-2023-94277',
    orderRef: '4567-A',
    customerName: 'Rohan Naidu',
    customerEmail: 'rohan.n@naiduenterprise.in',
    amount: 25000,
    tax: 4500,
    status: 'Paid',
    date: '2023-10-23',
    items: [
      { description: 'Wool Wrap Coat', quantity: 1, price: 25000 }
    ]
  },
  {
    number: 'INV-2023-94276',
    orderRef: '7788-V',
    customerName: 'Nikhilesh Rao',
    customerEmail: 'nikhilesh.rao@physics.isi.edu',
    amount: 15000,
    tax: 2700,
    status: 'Paid',
    date: '2023-10-23',
    items: [
      { description: 'Merino Wool Polo Shirt', quantity: 2, price: 7500 }
    ]
  },
  {
    number: 'INV-2023-94280',
    orderRef: '9021-C',
    customerName: 'Priya Reddy',
    customerEmail: 'priya.reddy@yahoo.co.in',
    amount: 6999,
    tax: 1260,
    status: 'Paid',
    date: '2023-10-24',
    items: [
      { description: 'Ribbed Knit Midi Dress', quantity: 1, price: 6999 }
    ]
  }
];


export const CREDIT_NOTES = [
  {
    number: 'CN-2023-94278',
    relatedInvoice: 'INV-2023-94278',
    customerName: 'Ekta Chowdary',
    refundAmount: 185000,
    reason: 'Size exchange cancellation before packaging',
    status: 'Issued',
    date: '2023-10-23'
  }
];


export const NOTIFICATION_TEMPLATES = [
  {
    id: 'temp-pay-success',
    eventName: 'Payment Successful',
    channel: 'Email',
    subject: 'Receipt for Order {orderId} at Fashion Store',
    body: 'Hi {customerName},\n\nWe have successfully processed your payment of {amount} for Order {orderId}.\n\nThank you for shopping with us!\nFashion Store Support'
  },
  {
    id: 'temp-pay-fail',
    eventName: 'Payment Failed Alert',
    channel: 'Email',
    subject: 'Action Required: Payment failed for Order {orderId}',
    body: 'Hi {customerName},\n\nYour transaction of {amount} for Order {orderId} has failed. Please verify your payment details and try again to avoid order cancellation.\n\nFashion Store Support'
  },
  {
    id: 'temp-sms-delivery',
    eventName: 'Out For Delivery Status',
    channel: 'SMS',
    body: 'FashionStore: Good news {customerName}! Your order {orderId} is out for delivery today. Track live at: fs-store.in/tr/{orderId}'
  },
  {
    id: 'temp-push-order',
    eventName: 'Order Status Update',
    channel: 'Push',
    body: 'Your Order {orderId} status has changed to: IN TRANSIT. Check your shipment status.'
  }
];


export const STATUS_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'Email',
    recipient: 'sneha.reddy@gmail.com',
    title: 'Receipt for Order 8291-B at Fashion Store',
    body: 'Hi Sneha Reddy,\n\nWe have successfully processed your payment of ₹1,15,000 for Order 8291-B.\n\nThank you for shopping with us!\nFashion Store Support',
    status: 'Sent',
    date: '2023-10-24T14:23:00',
    event: 'Payment Successful'
  },
  {
    id: 'notif-2',
    type: 'Email',
    recipient: 'amit.raju@rajuconsulting.in',
    title: 'Action Required: Payment failed for Order 1284-F',
    body: 'Hi Amit Raju,\n\nYour transaction of ₹45,000 for Order 1284-F has failed. Please verify your payment details and try again to avoid order cancellation.\n\nFashion Store Support',
    status: 'Sent',
    date: '2023-10-23T18:46:00',
    event: 'Payment Failed Alert'
  },
  {
    id: 'notif-3',
    type: 'SMS',
    recipient: '+91 98678 90123',
    title: 'Refund Processed',
    body: 'FashionStore: We have initiated a refund of ₹1,85,000 for Order 3344-Z to your UPI linked bank account. Thank you.',
    status: 'Sent',
    date: '2023-10-23T15:20:00',
    event: 'Refund Processed'
  }
];


export const SHIPMENTS = [
  {
    id: 'SH-2026-9041',
    orderId: '8291-B',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    shippingAddress: 'Flat 404, Maker Towers, Nariman Point, Mumbai, MH, 400021, India',
    courier: 'Delhivery',
    shippingMethod: 'Air',
    packageSummary: 'Slim Fit Corduroy Blazer x2, Classic Leather Brogues x1',
    shippingCost: 250,
    trackingNumber: 'DLV-983271-IND',
    labelGenerated: true,
    status: 'Ready to Ship',
    dispatchDate: 'Jun 22, 2026',
    estDeliveryDate: 'Jun 25, 2026'
  },
  {
    id: 'SH-2026-1029',
    orderId: '4567-A',
    customerName: 'Rohan Naidu',
    customerEmail: 'rohan.n@naiduenterprise.in',
    shippingAddress: '88, Koregaon Park Road, Lane 5, Pune, MH, 411001, India',
    courier: 'Blue Dart',
    shippingMethod: 'Air',
    packageSummary: 'Wool Wrap Coat x1',
    shippingCost: 350,
    trackingNumber: 'BD-829103-IND',
    labelGenerated: true,
    status: 'In Transit',
    dispatchDate: 'Jun 20, 2026',
    estDeliveryDate: 'Jun 24, 2026'
  },
  {
    id: 'SH-2026-5590',
    orderId: '7788-V',
    customerName: 'Nikhilesh Rao',
    customerEmail: 'nikhilesh.rao@physics.isi.edu',
    shippingAddress: 'Physics Dept, ISI, 203 B.T. Road, Kolkata, WB, 700108, India',
    courier: 'DTDC Express',
    shippingMethod: 'Land',
    packageSummary: 'Merino Wool Polo Shirt x2',
    shippingCost: 150,
    trackingNumber: 'DT-392812-IND',
    labelGenerated: true,
    status: 'Delivered',
    dispatchDate: 'Jun 18, 2026',
    estDeliveryDate: 'Jun 21, 2026'
  },
  {
    id: 'SH-2026-0819',
    orderId: '9900-U',
    customerName: 'Sujatha Reddy',
    customerEmail: 'sujatha.r@ap.gov.in',
    shippingAddress: '10 Janpath, New Delhi, Delhi, 110011, India',
    courier: 'Delhivery',
    shippingMethod: 'Air',
    packageSummary: 'Handcrafted Pashmina Shawl x1',
    shippingCost: 200,
    trackingNumber: 'DLV-102938-IND',
    labelGenerated: true,
    status: 'Delayed',
    dispatchDate: 'Jun 19, 2026',
    estDeliveryDate: 'Jun 23, 2026'
  }
];


export const RETURN_REQUESTS = [
  {
    id: 'RET-101',
    orderId: '9021-C',
    customerName: 'Priya Reddy',
    customerEmail: 'priya.reddy@yahoo.co.in',
    reason: 'Size too large',
    productName: 'Ribbed Knit Midi Dress',
    productPrice: 6999,
    status: 'Pending',
    requestDate: 'Jun 21, 2026'
  },
  {
    id: 'RET-102',
    orderId: '7788-V',
    customerName: 'Nikhilesh Rao',
    customerEmail: 'nikhilesh.rao@physics.isi.edu',
    reason: 'Incorrect color shipped',
    productName: 'Merino Wool Polo Shirt',
    productPrice: 7500,
    status: 'Approved',
    requestDate: 'Jun 19, 2026'
  },
  {
    id: 'RET-103',
    orderId: '1284-F',
    customerName: 'Amit Raju',
    customerEmail: 'amit.raju@rajuconsulting.in',
    reason: 'Fabric defect near collar',
    productName: 'Oversized Cashmere Sweater',
    productPrice: 15000,
    status: 'Pickup Scheduled',
    requestDate: 'Jun 20, 2026'
  }
];


export const REFUND_REQUESTS = [
  {
    id: 'REF-201',
    orderId: '3344-Z',
    amount: 185000,
    paymentMethod: 'UPI Linked Account',
    reason: 'Customer cancelled before shipping',
    status: 'Pending',
    requestDate: 'Jun 22, 2026',
    transactionId: 'pay_8820310283',
    timeline: [
      { title: 'Refund Requested', timestamp: 'Jun 22, 2026, 10:15 AM' }
    ]
  },
  {
    id: 'REF-202',
    orderId: '1122-Y',
    amount: 3500,
    paymentMethod: 'Razorpay UPI',
    reason: 'Failed double payment correction',
    status: 'Processed',
    requestDate: 'Jun 18, 2026',
    transactionId: 'pay_refund_11902',
    timeline: [
      { title: 'Refund Initiated', timestamp: 'Jun 18, 2026, 02:00 PM' },
      { title: 'Approved by Merchant', timestamp: 'Jun 18, 2026, 03:30 PM' },
      { title: 'Gateway Cleared', timestamp: 'Jun 19, 2026, 09:15 AM' }
    ]
  }
];


export const REPLACEMENT_ORDERS = [
  {
    id: 'REP-301',
    originalOrderId: '9021-C',
    customerName: 'Priya Reddy',
    customerEmail: 'priya.reddy@yahoo.co.in',
    originalProduct: 'Ribbed Knit Midi Dress (Size M)',
    replacementProduct: 'Ribbed Knit Midi Dress (Size S)',
    status: 'Pending',
    requestDate: 'Jun 21, 2026',
    trackingNumber: ''
  },
  {
    id: 'REP-302',
    originalOrderId: '4567-A',
    customerName: 'Rohan Naidu',
    customerEmail: 'rohan.n@naiduenterprise.in',
    originalProduct: 'Wool Wrap Coat (Size XL)',
    replacementProduct: 'Wool Wrap Coat (Size L)',
    status: 'Shipped',
    requestDate: 'Jun 15, 2026',
    trackingNumber: 'BD-998822-IND'
  }
];


export const TICKETS = [
  {
    id: '#TK-9821',
    customerName: 'Jyoti Reddy',
    customerEmail: 'jyoti.r@reddyretail.in',
    subject: 'Payment gateway timeout on checkout',
    category: 'Payments',
    priority: 'CRITICAL',
    status: 'In Progress',
    assignedAgent: 'Sunita Reddy',
    createdDate: 'Jun 22, 2026, 09:12 AM',
    updatedDate: 'Jun 22, 2026, 10:45 AM',
    slaDue: 'Jun 22, 2026, 11:12 AM',
    slaStatus: 'Breached',
    messages: [
      {
        id: 'msg-1',
        sender: 'Customer',
        senderName: 'Jyoti Reddy',
        text: 'Hello, we are experiencing repeated timeouts on UPI / Razorpay integration during checkout. It seems to happen specifically when users select QR Code scanner payment. Please look into this urgently.',
        timestamp: 'Jun 22, 2026, 09:12 AM',
        avatar: 'JR'
      },
      {
        id: 'msg-2',
        sender: 'System',
        senderName: 'Helpdesk Bot',
        text: 'Ticket created and assigned to Payments Tier 1 queue. Initial SLA target set to 2 hours.',
        timestamp: 'Jun 22, 2026, 09:13 AM'
      },
      {
        id: 'msg-3',
        sender: 'Agent',
        senderName: 'Sunita Reddy',
        text: 'Hi Jyoti, I am looking into your ticket now. I see the timeout errors in our checkout logs. It looks like the network request to Razorpay is taking over 15 seconds. Let me run diagnostics.',
        timestamp: 'Jun 22, 2026, 10:00 AM'
      },
      {
        id: 'msg-4',
        sender: 'Customer',
        senderName: 'Jyoti Reddy',
        text: 'Thanks Sunita. Any update? Customers are getting errors and abandoning carts.',
        timestamp: 'Jun 22, 2026, 10:45 AM',
        avatar: 'JR'
      }
    ],
    notes: [
      {
        id: 'note-1',
        author: 'Sunita Reddy',
        text: 'Investigating processor logs. Timeout seems to occur on verify request. Potential latency on the UPI partner bank side.',
        timestamp: 'Jun 22, 2026, 10:15 AM'
      }
    ],
    timeline: [
      { id: 'act-1', action: 'Ticket Created', actor: 'Jyoti Reddy', timestamp: 'Jun 22, 2026, 09:12 AM' },
      { id: 'act-2', action: 'Ticket Assigned to Sunita Reddy', actor: 'System', timestamp: 'Jun 22, 2026, 09:13 AM' },
      { id: 'act-3', action: 'Status changed to In Progress', actor: 'Sunita Reddy', timestamp: 'Jun 22, 2026, 10:00 AM' }
    ],
    attachments: [
      { name: 'checkout_error_screenshot.png', size: '245 KB', type: 'image/png' },
      { name: 'gateway_timeout_payload.json', size: '12 KB', type: 'application/json' }
    ]
  },
  {
    id: '#TK-9819',
    customerName: 'Gati Logistics',
    customerEmail: 'api-support@gati-ops.co.in',
    subject: 'API Authentication failing for v2 endpoints',
    category: 'Platform Integration',
    priority: 'HIGH',
    status: 'Open',
    assignedAgent: 'Unassigned',
    createdDate: 'Jun 22, 2026, 08:30 AM',
    updatedDate: 'Jun 22, 2026, 08:30 AM',
    slaDue: 'Jun 22, 2026, 12:30 PM',
    slaStatus: 'Warning',
    messages: [
      {
        id: 'msg-10',
        sender: 'Customer',
        senderName: 'Gati Developer',
        text: 'Our API integration using the v2 endpoints has started failing with 401 Unauthorized errors as of this morning. No changes were made on our credentials. Please verify if there is an issue with the auth servers.',
        timestamp: 'Jun 22, 2026, 08:30 AM',
        avatar: 'GD'
      }
    ],
    notes: [],
    timeline: [
      { id: 'act-10', action: 'Ticket Created', actor: 'Gati Logistics', timestamp: 'Jun 22, 2026, 08:30 AM' }
    ],
    attachments: []
  },
  {
    id: '#TK-9815',
    customerName: 'Karan Exports Ltd',
    customerEmail: 'ops@karanexports.in',
    subject: 'Bulk upload CSV formatting error',
    category: 'Inventory Mgmt',
    priority: 'MEDIUM',
    status: 'In Progress',
    assignedAgent: 'Manish Varma',
    createdDate: 'Jun 21, 2026, 11:20 AM',
    updatedDate: 'Jun 22, 2026, 09:15 AM',
    slaDue: 'Jun 23, 2026, 11:20 AM',
    slaStatus: 'Within Limits',
    messages: [
      {
        id: 'msg-20',
        sender: 'Customer',
        senderName: 'Karan Ops Desk',
        text: 'Hello. When trying to import our weekly inventory sheet via the CSV bulk upload feature, we get a generic "Parsing Error: Column mismatch" despite using the exact same format as last week. We have attached the CSV.',
        timestamp: 'Jun 21, 2026, 11:20 AM',
        avatar: 'KO'
      },
      {
        id: 'msg-21',
        sender: 'Agent',
        senderName: 'Manish Varma',
        text: 'Hi, I have received the CSV sheet. I will check the file headers against our database schema to find which column is causing the rejection. Usually this happens due to trailing whitespace.',
        timestamp: 'Jun 22, 2026, 09:15 AM'
      }
    ],
    notes: [],
    timeline: [
      { id: 'act-20', action: 'Ticket Created', actor: 'Karan Exports Ltd', timestamp: 'Jun 21, 2026, 11:20 AM' },
      { id: 'act-21', action: 'Ticket Assigned to Manish Varma', actor: 'System', timestamp: 'Jun 21, 2026, 11:22 AM' },
      { id: 'act-22', action: 'Status changed to In Progress', actor: 'Manish Varma', timestamp: 'Jun 22, 2026, 09:15 AM' }
    ],
    attachments: [
      { name: 'inventory_import_week25.csv', size: '1.4 MB', type: 'text/csv' }
    ]
  },
  {
    id: '#TK-9788',
    customerName: 'Sree Boutique',
    customerEmail: 'billing@sreeboutique.in',
    subject: 'Unauthorized refund request detected',
    category: 'Risk & Security',
    priority: 'CRITICAL',
    status: 'Escalated',
    assignedAgent: 'Ekta Chowdary',
    createdDate: 'Jun 20, 2026, 03:45 PM',
    updatedDate: 'Jun 22, 2026, 11:00 AM',
    slaDue: 'Jun 20, 2026, 05:45 PM',
    slaStatus: 'Breached',
    escalationReason: 'Suspicious refunds matching patterns flagged by security systems. Needs manual verification.',
    escalatedTo: 'Tier-2 Fraud Ops',
    messages: [
      {
        id: 'msg-30',
        sender: 'Customer',
        senderName: 'Manager Sree',
        text: 'We noticed a refund of ₹1,85,000 on Order #3344-Z that was not triggered by any of our operators. We suspect our API key or operator session might have been hijacked. Please audit this refund transaction immediately.',
        timestamp: 'Jun 20, 2026, 03:45 PM',
        avatar: 'MS'
      },
      {
        id: 'msg-31',
        sender: 'Agent',
        senderName: 'Ekta Chowdary',
        text: 'Hello, I have locked the transaction and temporarily suspended the associated operator session. This has been escalated to Tier-2 Security for a full audit of IP ranges and signatures.',
        timestamp: 'Jun 22, 2026, 11:00 AM'
      }
    ],
    notes: [
      {
        id: 'note-30',
        author: 'System Security',
        text: 'Automated lock applied to api_session_9921_x2 due to suspicious billing operations.',
        timestamp: 'Jun 20, 2026, 04:00 PM'
      }
    ],
    timeline: [
      { id: 'act-30', action: 'Ticket Created', actor: 'Sree Boutique', timestamp: 'Jun 20, 2026, 03:45 PM' },
      { id: 'act-31', action: 'Assigned to Ekta Chowdary', actor: 'System', timestamp: 'Jun 20, 2026, 03:50 PM' },
      { id: 'act-32', action: 'Escalated to Tier-2 Fraud Ops', actor: 'Ekta Chowdary', timestamp: 'Jun 22, 2026, 11:00 AM' }
    ],
    attachments: []
  },
  {
    id: '#TK-9755',
    customerName: 'Ananda Solutions',
    customerEmail: 'it-admin@anandasols.in',
    subject: 'Password reset loop for secondary admin',
    category: 'IAM Module',
    priority: 'LOW',
    status: 'Resolved',
    assignedAgent: 'Lalit Rao',
    createdDate: 'Jun 19, 2026, 02:15 PM',
    updatedDate: 'Jun 20, 2026, 11:00 AM',
    slaDue: 'Jun 22, 2026, 02:15 PM',
    slaStatus: 'Resolved',
    resolutionNotes: 'Reset token lifetime was set to 5 minutes, which was too short. Extended reset token window to 30 minutes in tenant config, which resolved the user looping error.',
    messages: [
      {
        id: 'msg-40',
        sender: 'Customer',
        senderName: 'Ananda Admin',
        text: 'Our co-admin is trying to set up their account but gets stuck in a password reset loop. The reset link is expiring almost immediately before they can complete the forms.',
        timestamp: 'Jun 19, 2026, 02:15 PM',
        avatar: 'AA'
      },
      {
        id: 'msg-41',
        sender: 'Agent',
        senderName: 'Lalit Rao',
        text: 'Hello, I have adjusted your tenant configuration. The expiration window for the password link is now extended to 30 minutes. Could you ask them to trigger a new link and try again?',
        timestamp: 'Jun 20, 2026, 10:15 AM'
      },
      {
        id: 'msg-42',
        sender: 'Customer',
        senderName: 'Ananda Admin',
        text: 'Thank you! That resolved it. They were able to log in successfully.',
        timestamp: 'Jun 20, 2026, 11:00 AM',
        avatar: 'AA'
      }
    ],
    notes: [],
    timeline: [
      { id: 'act-40', action: 'Ticket Created', actor: 'Ananda Solutions', timestamp: 'Jun 19, 2026, 02:15 PM' },
      { id: 'act-41', action: 'Assigned to Lalit Rao', actor: 'System', timestamp: 'Jun 19, 2026, 02:20 PM' },
      { id: 'act-42', action: 'Ticket Resolved', actor: 'Lalit Rao', timestamp: 'Jun 20, 2026, 11:00 AM' }
    ],
    attachments: []
  }
];


export const AGENTS = [
  'Sunita Reddy',
  'Manish Varma',
  'Ekta Chowdary',
  'Lalit Rao',
  'Amit Naidu',
  'Pooja Reddy'
];


export const TICKET_CATEGORIES = [
  'Payments',
  'Platform Integration',
  'Inventory Mgmt',
  'Risk & Security',
  'IAM Module',
  'Customer Accounts'
];

export const CANCELLATION_REQUESTS = [
  {
    id: 'CAN-401',
    orderId: '8291-B',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    reason: 'Incorrect size ordered',
    status: 'Pending',
    action: 'Refund',
    requestDate: 'Jun 22, 2026',
    comments: 'I accidentally ordered a Size L but I need a Size M. Please refund so I can reorder.'
  },
  {
    id: 'CAN-402',
    orderId: '4567-A',
    customerName: 'Rohan Naidu',
    customerEmail: 'rohan.n@naiduenterprise.in',
    reason: 'Changed my mind',
    status: 'Approved',
    action: 'Refund',
    requestDate: 'Jun 20, 2026',
    comments: 'No longer need this coat.'
  },
  {
    id: 'CAN-403',
    orderId: '5566-W',
    customerName: 'Charitha Rao',
    customerEmail: 'charitha.r@raoclinics.in',
    reason: 'Delivery delay',
    status: 'Rejected',
    action: 'Refund',
    requestDate: 'Jun 19, 2026',
    comments: 'It is taking too long to ship.'
  }
];
