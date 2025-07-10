

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust if your Next.js app runs on a different port

// Dummy admin session (replace with actual session token if authentication is strict)
// For development, NextAuth might allow unauthenticated access to API routes if not protected.
// In a real scenario, you'd need to obtain a session token (e.g., by logging in).
const headers = { 'Content-Type': 'application/json' };

async function createMaterial(materialData) {
  const res = await fetch(`${API_BASE_URL}/materials`, {
    method: 'POST',
    headers,
    body: JSON.stringify(materialData),
  });
  if (!res.ok) {
    const error = await res.json();
    console.error(`Failed to create material ${materialData.name}:`, error);
    return null;
  }
  const data = await res.json();
  console.log(`Created material: ${data.name}`);
  return data;
}

async function createProcessingProduct(processingProductData) {
  const res = await fetch(`${API_BASE_URL}/processing-products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(processingProductData),
  });
  if (!res.ok) {
    const error = await res.json();
    console.error(`Failed to create processing product ${processingProductData.processingCode}:`, error);
    return null;
  }
  const data = await res.json();
  console.log(`Created processing product: ${data.processingCode}`);
  return data;
}

async function createFinishedProduct(finishedProductData) {
  const res = await fetch(`${API_BASE_URL}/finished-products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(finishedProductData),
  });
  if (!res.ok) {
    const error = await res.json();
    console.error(`Failed to create finished product ${finishedProductData.finishedCode}:`, error);
    return null;
  }
  const data = await res.json();
  console.log(`Created finished product: ${data.finishedCode}`);
  return data;
}

async function populateData() {
  console.log('Starting data population...');

  // --- 1. Create Materials ---
  const materialsToCreate = [
    { name: 'Gabadin Cloth', unit: 'meter', quantityInStock: 1000, reorderLevel: 100, costPerUnit: 120.00 },
    { name: 'Connecting Lace', unit: 'bundle', quantityInStock: 500, reorderLevel: 50, costPerUnit: 220.00 },
    { name: 'Chemical Lace', unit: 'bundle', quantityInStock: 500, reorderLevel: 50, costPerUnit: 200.00 },
    { name: 'Cotton Lace (Peticote)', unit: 'bundle', quantityInStock: 200, reorderLevel: 20, costPerUnit: 250.00 },
    { name: 'Tarsel', unit: 'piece', quantityInStock: 1000, reorderLevel: 100, costPerUnit: 15.00 },
    { name: 'Zipper No-5', unit: 'yard', quantityInStock: 500, reorderLevel: 50, costPerUnit: 5.00 },
    { name: 'Zipper No-8', unit: 'yard', quantityInStock: 500, reorderLevel: 50, costPerUnit: 8.00 },
    { name: 'Zipper No-3', unit: 'piece', quantityInStock: 500, reorderLevel: 50, costPerUnit: 2.50 },
    { name: 'Runner No-5', unit: 'piece', quantityInStock: 2000, reorderLevel: 200, costPerUnit: 1.80 },
    { name: 'Runner No-8', unit: 'piece', quantityInStock: 500, reorderLevel: 50, costPerUnit: 7.00 },
    { name: 'Fita 1.5" ', unit: 'bundle', quantityInStock: 200, reorderLevel: 20, costPerUnit: 150.00 },
    { name: 'Sewing Thread', unit: 'piece', quantityInStock: 500, reorderLevel: 50, costPerUnit: 35.00 },
    { name: 'Thick Foam', unit: 'yard', quantityInStock: 200, reorderLevel: 20, costPerUnit: 120.00 },
    { name: 'Black Foam', unit: 'yard', quantityInStock: 100, reorderLevel: 10, costPerUnit: 110.00 },
    { name: 'Thin Black Foam', unit: 'yard', quantityInStock: 50, reorderLevel: 5, costPerUnit: 60.00 },
    { name: 'Board', unit: 'piece', quantityInStock: 50, reorderLevel: 5, costPerUnit: 100.00 },
    { name: 'Others', unit: 'unit', quantityInStock: 1000, reorderLevel: 100, costPerUnit: 20.00 },
  ];

  const createdMaterials = {};
  for (const mat of materialsToCreate) {
    const newMat = await createMaterial(mat);
    if (newMat) {
      createdMaterials[newMat.name] = newMat._id;
    }
  }

  // --- 2. Create Processing Products ---
  const processingProductsToCreate = [
    {
      purchasedProduct: createdMaterials['Gabadin Cloth'],
      processingCode: 'PPRO-001',
      cuttingStaff: 'Ali',
      embroideryStaff: 'Fatima',
      packagingStaff: 'Rahim',
      startDate: '2025-06-10',
      endDate: '2025-06-15',
      status: 'Completed',
      notes: 'Initial batch of Gabadin for Bedsheets',
      category: 'Bedsheet',
      subCategory: 'General',
    },
    {
      purchasedProduct: createdMaterials['Sewing Thread'],
      processingCode: 'PPRO-002',
      cuttingStaff: 'Kamal',
      embroideryStaff: 'N/A',
      packagingStaff: 'Rahim',
      startDate: '2025-06-12',
      endDate: '2025-06-18',
      status: 'Completed',
      notes: 'Thread processing for various garments',
      category: 'General',
      subCategory: 'Thread',
    },
    {
      purchasedProduct: createdMaterials['Connecting Lace'],
      processingCode: 'PPRO-003',
      cuttingStaff: 'Ali',
      embroideryStaff: 'N/A',
      packagingStaff: 'Rahim',
      startDate: '2025-06-15',
      endDate: '2025-06-20',
      status: 'Completed',
      notes: 'Lace preparation for Runner Sets',
      category: 'Runner',
      subCategory: 'Lace',
    },
  ];

  const createdProcessingProducts = {};
  for (const pprod of processingProductsToCreate) {
    const newPProd = await createProcessingProduct(pprod);
    if (newPProd) {
      createdProcessingProducts[newPProd.processingCode] = newPProd._id;
    }
  }

  // --- 3. Create Finished Products ---
  const finishedProductsToCreate = [
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-001',
      finishedDate: '2025-06-20',
      productType: 'Formal',
      sizes: [{ size: 'King', quantity: 5 }],
      imageUrl: '/uploads/bedsheet-vip.jpg',
      price: 29400.00 / 5, // VIP Bedsheet
      category: 'Bedsheet',
      subCategory: 'VIP',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-002',
      finishedDate: '2025-06-22',
      productType: 'Text',
      sizes: [{ size: 'Queen', quantity: 30 }],
      imageUrl: '/uploads/bedsheet-print.jpg',
      price: 37950.00 / 30, // Bedsheet Print
      category: 'Bedsheet',
      subCategory: 'Print',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-003'],
      finishedCode: 'FPRO-003',
      finishedDate: '2025-06-25',
      productType: 'Formal',
      sizes: [{ size: 'Standard', quantity: 20 }],
      imageUrl: '/uploads/runner-sofa.jpg',
      price: 30000.00 / 20, // Runner Set (Sofa)
      category: 'Runner',
      subCategory: 'Sofa',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-004',
      finishedDate: '2025-06-26',
      productType: 'Other',
      sizes: [{ size: 'One Size', quantity: 50 }],
      imageUrl: '/uploads/short-long-runner.jpg',
      price: 9375.00 / 50, // Short/Long Runner
      category: 'Runner',
      subCategory: 'Short/Long',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-005',
      finishedDate: '2025-06-28',
      productType: 'Formal',
      sizes: [{ size: 'King', quantity: 20 }],
      imageUrl: '/uploads/bedsheet-ambrodary.jpg',
      price: 9000.00 / 20, // Bedsheet Ambrodary
      category: 'Bedsheet',
      subCategory: 'Embroidery',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-006',
      finishedDate: '2025-06-28',
      productType: 'Formal',
      sizes: [{ size: 'Queen', quantity: 20 }],
      imageUrl: '/uploads/bedsheet-aplic.jpg',
      price: 9000.00 / 20, // Bedsheet Aplic
      category: 'Bedsheet',
      subCategory: 'Applique',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-007',
      finishedDate: '2025-06-30',
      productType: 'Text',
      sizes: [{ size: 'Standard', quantity: 100 }],
      imageUrl: '/uploads/block-bedsheet.jpg',
      price: 81000.00 / 100, // Block Bedsheet
      category: 'Bedsheet',
      subCategory: 'Block Print',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-003'],
      finishedCode: 'FPRO-008',
      finishedDate: '2025-07-01',
      productType: 'Text',
      sizes: [{ size: 'Standard', quantity: 30 }],
      imageUrl: '/uploads/block-runner-set.jpg',
      price: 8100.00 / 30, // Block Runner Set
      category: 'Runner',
      subCategory: 'Block Print',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-009',
      finishedDate: '2025-07-02',
      productType: 'Other',
      sizes: [{ size: 'Standard', quantity: 20 }],
      imageUrl: '/uploads/block-cushion-cover.jpg',
      price: 5400.00 / 20, // Block Cushion Cover
      category: 'Cushion Cover',
      subCategory: 'Block Print',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-010',
      finishedDate: '2025-07-03',
      productType: 'Other',
      sizes: [{ size: 'Small', quantity: 50 }],
      imageUrl: '/uploads/basin-tawal.jpg',
      price: 4750.00 / 50, // Basin Tawal
      category: 'Towel',
      subCategory: 'Basin',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-011',
      finishedDate: '2025-07-03',
      productType: 'Other',
      sizes: [{ size: 'Medium', quantity: 100 }],
      imageUrl: '/uploads/kitchen-tawal.jpg',
      price: 5000.00 / 100, // Kitchen Tawal
      category: 'Towel',
      subCategory: 'Kitchen',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-012',
      finishedDate: '2025-07-04',
      productType: 'Formal',
      sizes: [{ size: 'Standard', quantity: 20 }],
      imageUrl: '/uploads/cushion-cover-ambrodary.jpg',
      price: 5400.00 / 20, // Cushion Cover Ambrodary
      category: 'Cushion Cover',
      subCategory: 'Embroidery',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-013',
      finishedDate: '2025-07-05',
      productType: 'Text',
      sizes: [{ size: 'Standard', quantity: 20 }],
      imageUrl: '/uploads/chair-cover-set-block.jpg',
      price: 14400.00 / 20, // Chair Cover Set Block
      category: 'Chair Cover',
      subCategory: 'Block Print',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-003'],
      finishedCode: 'FPRO-014',
      finishedDate: '2025-07-05',
      productType: 'Text',
      sizes: [{ size: 'Standard', quantity: 20 }],
      imageUrl: '/uploads/batic-runner-set.jpg',
      price: 10800.00 / 20, // Batic Runner Set
      category: 'Runner',
      subCategory: 'Batik',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-003'],
      finishedCode: 'FPRO-015',
      finishedDate: '2025-07-06',
      productType: 'Formal',
      sizes: [{ size: 'Standard', quantity: 10 }],
      imageUrl: '/uploads/katan-runner-set.jpg',
      price: 4500.00 / 10, // Katan Runner Set
      category: 'Runner',
      subCategory: 'Katan',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-016',
      finishedDate: '2025-07-07',
      productType: 'Formal',
      sizes: [{ size: 'One Size', quantity: 50 }],
      imageUrl: '/uploads/abaya-design.jpg',
      price: 20000.00 / 50, // Abaya Design
      category: 'Abaya',
      subCategory: 'Design',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-017',
      finishedDate: '2025-07-08',
      productType: 'Text',
      sizes: [{ size: 'One Size', quantity: 100 }],
      imageUrl: '/uploads/khimar-jorjet.jpg',
      price: 60000.00 / 100, // Khimar Jorjet
      category: 'Khimar',
      subCategory: 'Georgette',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-018',
      finishedDate: '2025-07-08',
      productType: 'Text',
      sizes: [{ size: 'One Size', quantity: 100 }],
      imageUrl: '/uploads/khimar-lilen.jpg',
      price: 56250.00 / 100, // Khimar Lilen
      category: 'Khimar',
      subCategory: 'Linen',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-019',
      finishedDate: '2025-07-09',
      productType: 'Text',
      sizes: [{ size: '47x48', quantity: 100 }],
      imageUrl: '/uploads/hiab-suti.jpg',
      price: 30600.00 / 100, // Hiab Suti (47"*48")
      category: 'Hijab',
      subCategory: 'Suti',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-020',
      finishedDate: '2025-07-09',
      productType: 'Text',
      sizes: [{ size: '56x57', quantity: 100 }],
      imageUrl: '/uploads/hijab-long.jpg',
      price: 38250.00 / 100, // Hijab Long (56"*57")
      category: 'Hijab',
      subCategory: 'Long',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-021',
      finishedDate: '2025-07-10',
      productType: 'Text',
      sizes: [{ size: 'One Size', quantity: 100 }],
      imageUrl: '/uploads/khimar-suti.jpg',
      price: 56100.00 / 100, // Khimar Suti
      category: 'Khimar',
      subCategory: 'Suti',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-022',
      finishedDate: '2025-07-11',
      productType: 'Text',
      sizes: [{ size: 'Standard', quantity: 50 }],
      imageUrl: '/uploads/block-three-pic.jpg',
      price: 27600.00 / 50, // Block Three-pic
      category: 'Three-Piece',
      subCategory: 'Block Print',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-023',
      finishedDate: '2025-07-11',
      productType: 'Other',
      sizes: [{ size: 'Baby', quantity: 30 }],
      imageUrl: '/uploads/baby-fatwa-block.jpg',
      price: 3105.00 / 30, // Baby Fatwa Block
      category: 'Fatwa',
      subCategory: 'Baby Block',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-024',
      finishedDate: '2025-07-12',
      productType: 'Other',
      sizes: [{ size: 'Standard', quantity: 50 }],
      imageUrl: '/uploads/peticote-design.jpg',
      price: 9750.00 / 50, // Peticote Design
      category: 'Petticoat',
      subCategory: 'Design',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-025',
      finishedDate: '2025-07-12',
      productType: 'Other',
      sizes: [{ size: 'Small', quantity: 30 }],
      imageUrl: '/uploads/batuya-bag-design.jpg',
      price: 2100.00 / 30, // Batuya Bag Design
      category: 'Bag',
      subCategory: 'Batuya Design',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-026',
      finishedDate: '2025-07-13',
      productType: 'Other',
      sizes: [{ size: 'Standard', quantity: 30 }],
      imageUrl: '/uploads/churrir-box.jpg',
      price: 1125.00 / 30, // Churrir Box
      category: 'Box',
      subCategory: 'Churrir',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-027',
      finishedDate: '2025-07-14',
      productType: 'Other',
      sizes: [{ size: 'Baby', quantity: 100 }],
      imageUrl: '/uploads/baby-frock.jpg',
      price: 30000.00 / 100, // Baby Frock
      category: 'Frock',
      subCategory: 'Baby',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-003'],
      finishedCode: 'FPRO-028',
      finishedDate: '2025-07-14',
      productType: 'Formal',
      sizes: [{ size: 'Standard', quantity: 20 }],
      imageUrl: '/uploads/cord-d-set.jpg',
      price: 15750.00 / 20, // Cord-d set
      category: 'Set',
      subCategory: 'Cord-D',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-029',
      finishedDate: '2025-07-15',
      productType: 'Text',
      sizes: [{ size: 'One Size', quantity: 30 }],
      imageUrl: '/uploads/one-pic-print.jpg',
      price: 14000.00 / 30, // One-pic print
      category: 'One-Piece',
      subCategory: 'Print',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-001'],
      finishedCode: 'FPRO-030',
      finishedDate: '2025-07-15',
      productType: 'Formal',
      sizes: [{ size: 'Standard', quantity: 30 }],
      imageUrl: '/uploads/print-chair-cover-set.jpg',
      price: 21600.00 / 30, // Print Chair Cover Set
      category: 'Chair Cover',
      subCategory: 'Print',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-031',
      finishedDate: '2025-07-16',
      productType: 'Other',
      sizes: [{ size: 'Standard', quantity: 50 }],
      imageUrl: '/uploads/organizer-holder.jpg',
      price: 4000.00 / 50, // Organiger Holder
      category: 'Holder',
      subCategory: 'Organizer',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-032',
      finishedDate: '2025-07-16',
      productType: 'Other',
      sizes: [{ size: 'Standard', quantity: 50 }],
      imageUrl: '/uploads/multipurpose-cover.jpg',
      price: 4000.00 / 50, // Multipurepose Cover
      category: 'Cover',
      subCategory: 'Multipurpose',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-033',
      finishedDate: '2025-07-17',
      productType: 'Other',
      sizes: [{ size: 'Small', quantity: 100 }],
      imageUrl: '/uploads/bazar-bag.jpg',
      price: 5500.00 / 100, // Bazar bag
      category: 'Bag',
      subCategory: 'Bazar',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-034',
      finishedDate: '2025-07-17',
      productType: 'Other',
      sizes: [{ size: 'Medium', quantity: 100 }],
      imageUrl: '/uploads/travel-bag.jpg',
      price: 11000.00 / 100, // Trevel Bag
      category: 'Bag',
      subCategory: 'Travel',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-035',
      finishedDate: '2025-07-18',
      productType: 'Other',
      sizes: [{ size: 'Small', quantity: 50 }],
      imageUrl: '/uploads/cosmetic-kit-bag.jpg',
      price: 4125.00 / 50, // Cosmetic kit bag
      category: 'Bag',
      subCategory: 'Cosmetic Kit',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-036',
      finishedDate: '2025-07-18',
      productType: 'Other',
      sizes: [{ size: 'Small', quantity: 50 }],
      imageUrl: '/uploads/cosmetic-bag.jpg',
      price: 2750.00 / 50, // Cosmetic bag
      category: 'Bag',
      subCategory: 'Cosmetic',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-037',
      finishedDate: '2025-07-19',
      productType: 'Other',
      sizes: [{ size: 'Standard', quantity: 100 }],
      imageUrl: '/uploads/pencil-box.jpg',
      price: 2750.00 / 100, // Pencil box
      category: 'Box',
      subCategory: 'Pencil',
    },
    {
      processingProduct: createdProcessingProducts['PPRO-002'],
      finishedCode: 'FPRO-038',
      finishedDate: '2025-07-19',
      productType: 'Other',
      sizes: [{ size: 'Standard', quantity: 100 }],
      imageUrl: '/uploads/school-bag.jpg',
      price: 4125.00 / 100, // School Bag
      category: 'Bag',
      subCategory: 'School',
    },
  ];

  for (const fprod of finishedProductsToCreate) {
    await createFinishedProduct(fprod);
  }

  console.log('Data population complete!');
}

populateData();