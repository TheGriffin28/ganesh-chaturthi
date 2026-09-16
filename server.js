const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL connection attempt with in-memory fallback
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ganesh_chaturthi',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

let useInMemory = false;

// In-Memory Data Store (Fallback)
const dbMemory = {
  pandals: [
    { id: 1, name: 'Lalbaugcha Raja Samiti', location: 'Parel, Mumbai', organizer_name: 'Sanjay Raut', contact_number: '+91 9820011223', status: 'Active', budget: 5000000, created_at: new Date().toISOString() },
    { id: 2, name: 'GSB Seva Mandal', location: 'King Circle, Mumbai', organizer_name: 'Vijay Kamath', contact_number: '+91 9833445566', status: 'Active', budget: 7500000, created_at: new Date().toISOString() },
    { id: 3, name: 'Andhericha Raja', location: 'Andheri West, Mumbai', organizer_name: 'Ramesh Sawant', contact_number: '+91 9811223344', status: 'Active', budget: 3500000, created_at: new Date().toISOString() }
  ],
  donations: [
    { id: 1, pandal_id: 1, donor_name: 'Rajesh Sharma', amount: 50000, payment_mode: 'UPI', receipt_number: 'REC-1001', created_at: new Date().toISOString() },
    { id: 2, pandal_id: 2, donor_name: 'Sunita Patel', amount: 100000, payment_mode: 'Bank Transfer', receipt_number: 'REC-1002', created_at: new Date().toISOString() }
  ],
  puja_bookings: [
    { id: 1, pandal_id: 1, devotee_name: 'Aarav Mehta', devotee_phone: '+91 9892012345', puja_type: 'Maha Aarti', slot_time: '2025-09-07T18:00:00.000Z', status: 'Confirmed', created_at: new Date().toISOString() },
    { id: 2, pandal_id: 2, devotee_name: 'Priya Joshi', devotee_phone: '+91 9876543210', puja_type: 'Special Archana', slot_time: '2025-09-08T10:30:00.000Z', status: 'Confirmed', created_at: new Date().toISOString() }
  ],
  visarjan_slots: [
    { id: 1, pandal_id: 1, location_ghat: 'Girgaon Chowpatty', immersion_type: 'Sea Immersion', slot_time: '2025-09-17T17:00:00.000Z', vehicle_type: 'Heavy Truck', status: 'Scheduled', created_at: new Date().toISOString() },
    { id: 2, pandal_id: 3, location_ghat: 'Versova Beach Eco-Tank', immersion_type: 'Eco-Friendly Tank', slot_time: '2025-09-12T16:00:00.000Z', vehicle_type: 'Medium Tempo', status: 'Scheduled', created_at: new Date().toISOString() }
  ],
  nextIds: { pandals: 4, donations: 3, puja_bookings: 3, visarjan_slots: 3 }
};

// Check DB Connection
pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL Database.');
    client.release();
  })
  .catch(err => {
    console.warn('PostgreSQL database connection unavailable. Falling back to In-Memory Data Store.');
    useInMemory = true;
  });

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: useInMemory ? 'in-memory' : 'postgres', timestamp: new Date() });
});

// Overall Dashboard Analytics / Stats
app.get('/api/stats', async (req, res) => {
  if (useInMemory) {
    const totalPandals = dbMemory.pandals.length;
    const totalDonations = dbMemory.donations.reduce((acc, d) => acc + Number(d.amount), 0);
    const totalPujaBookings = dbMemory.puja_bookings.filter(b => b.status === 'Confirmed').length;
    const totalVisarjanSlots = dbMemory.visarjan_slots.length;
    return res.json({ totalPandals, totalDonations, totalPujaBookings, totalVisarjanSlots });
  }

  try {
    const [pandalsRes, donationsRes, pujaRes, visarjanRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM pandals'),
      pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM donations'),
      pool.query("SELECT COUNT(*) FROM puja_bookings WHERE status = 'Confirmed'"),
      pool.query('SELECT COUNT(*) FROM visarjan_slots')
    ]);

    res.json({
      totalPandals: parseInt(pandalsRes.rows[0].count, 10),
      totalDonations: parseFloat(donationsRes.rows[0].total),
      totalPujaBookings: parseInt(pujaRes.rows[0].count, 10),
      totalVisarjanSlots: parseInt(visarjanRes.rows[0].count, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PANDALS CRUD
app.get('/api/pandals', async (req, res) => {
  if (useInMemory) return res.json(dbMemory.pandals);
  try {
    const result = await pool.query('SELECT * FROM pandals ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pandals', async (req, res) => {
  const { name, location, organizer_name, contact_number, status, budget } = req.body;
  if (!name || !location || !organizer_name || !contact_number) {
    return res.status(400).json({ error: 'Missing required fields: name, location, organizer_name, contact_number' });
  }

  if (useInMemory) {
    const newPandal = {
      id: dbMemory.nextIds.pandals++,
      name,
      location,
      organizer_name,
      contact_number,
      status: status || 'Active',
      budget: parseFloat(budget || 0),
      created_at: new Date().toISOString()
    };
    dbMemory.pandals.unshift(newPandal);
    return res.status(201).json(newPandal);
  }

  try {
    const result = await pool.query(
      `INSERT INTO pandals (name, location, organizer_name, contact_number, status, budget)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, location, organizer_name, contact_number, status || 'Active', budget || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pandals/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, location, organizer_name, contact_number, status, budget } = req.body;

  if (useInMemory) {
    const pandal = dbMemory.pandals.find(p => p.id === id);
    if (!pandal) return res.status(404).json({ error: 'Pandal not found' });

    if (name) pandal.name = name;
    if (location) pandal.location = location;
    if (organizer_name) pandal.organizer_name = organizer_name;
    if (contact_number) pandal.contact_number = contact_number;
    if (status) pandal.status = status;
    if (budget !== undefined) pandal.budget = parseFloat(budget);

    return res.json(pandal);
  }

  try {
    const result = await pool.query(
      `UPDATE pandals SET
        name = COALESCE($1, name),
        location = COALESCE($2, location),
        organizer_name = COALESCE($3, organizer_name),
        contact_number = COALESCE($4, contact_number),
        status = COALESCE($5, status),
        budget = COALESCE($6, budget)
       WHERE id = $7 RETURNING *`,
      [name, location, organizer_name, contact_number, status, budget, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pandal not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pandals/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (useInMemory) {
    const index = dbMemory.pandals.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Pandal not found' });
    dbMemory.pandals.splice(index, 1);
    // cascade delete in memory
    dbMemory.donations = dbMemory.donations.filter(d => d.pandal_id !== id);
    dbMemory.puja_bookings = dbMemory.puja_bookings.filter(b => b.pandal_id !== id);
    dbMemory.visarjan_slots = dbMemory.visarjan_slots.filter(v => v.pandal_id !== id);
    return res.json({ message: 'Pandal deleted successfully' });
  }

  try {
    const result = await pool.query('DELETE FROM pandals WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pandal not found' });
    res.json({ message: 'Pandal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DONATIONS CRUD
app.get('/api/donations', async (req, res) => {
  if (useInMemory) return res.json(dbMemory.donations);
  try {
    const result = await pool.query(`
      SELECT d.*, p.name as pandal_name 
      FROM donations d 
      JOIN pandals p ON d.pandal_id = p.id 
      ORDER BY d.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/donations', async (req, res) => {
  const { pandal_id, donor_name, amount, payment_mode, receipt_number } = req.body;
  if (!pandal_id || !donor_name || !amount || !payment_mode) {
    return res.status(400).json({ error: 'Missing required fields for donation' });
  }

  const generatedReceipt = receipt_number || `REC-${Math.floor(100000 + Math.random() * 900000)}`;

  if (useInMemory) {
    const newDonation = {
      id: dbMemory.nextIds.donations++,
      pandal_id: parseInt(pandal_id, 10),
      donor_name,
      amount: parseFloat(amount),
      payment_mode,
      receipt_number: generatedReceipt,
      created_at: new Date().toISOString()
    };
    dbMemory.donations.unshift(newDonation);
    return res.status(201).json(newDonation);
  }

  try {
    const result = await pool.query(
      `INSERT INTO donations (pandal_id, donor_name, amount, payment_mode, receipt_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [pandal_id, donor_name, amount, payment_mode, generatedReceipt]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/donations/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (useInMemory) {
    const idx = dbMemory.donations.findIndex(d => d.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Donation not found' });
    dbMemory.donations.splice(idx, 1);
    return res.json({ message: 'Donation deleted successfully' });
  }

  try {
    const result = await pool.query('DELETE FROM donations WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Donation not found' });
    res.json({ message: 'Donation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUJA BOOKINGS CRUD
app.get('/api/puja-bookings', async (req, res) => {
  if (useInMemory) return res.json(dbMemory.puja_bookings);
  try {
    const result = await pool.query(`
      SELECT pb.*, p.name as pandal_name 
      FROM puja_bookings pb 
      JOIN pandals p ON pb.pandal_id = p.id 
      ORDER BY pb.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/puja-bookings', async (req, res) => {
  const { pandal_id, devotee_name, devotee_phone, puja_type, slot_time, status } = req.body;
  if (!pandal_id || !devotee_name || !devotee_phone || !puja_type || !slot_time) {
    return res.status(400).json({ error: 'Missing required puja booking fields' });
  }

  if (useInMemory) {
    const newBooking = {
      id: dbMemory.nextIds.puja_bookings++,
      pandal_id: parseInt(pandal_id, 10),
      devotee_name,
      devotee_phone,
      puja_type,
      slot_time,
      status: status || 'Confirmed',
      created_at: new Date().toISOString()
    };
    dbMemory.puja_bookings.unshift(newBooking);
    return res.status(201).json(newBooking);
  }

  try {
    const result = await pool.query(
      `INSERT INTO puja_bookings (pandal_id, devotee_name, devotee_phone, puja_type, slot_time, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [pandal_id, devotee_name, devotee_phone, puja_type, slot_time, status || 'Confirmed']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/puja-bookings/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (useInMemory) {
    const booking = dbMemory.puja_bookings.find(b => b.id === id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (status) booking.status = status;
    return res.json(booking);
  }

  try {
    const result = await pool.query(
      'UPDATE puja_bookings SET status = COALESCE($1, status) WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/puja-bookings/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (useInMemory) {
    const idx = dbMemory.puja_bookings.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
    dbMemory.puja_bookings.splice(idx, 1);
    return res.json({ message: 'Booking deleted successfully' });
  }

  try {
    const result = await pool.query('DELETE FROM puja_bookings WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VISARJAN SLOTS CRUD
app.get('/api/visarjan-slots', async (req, res) => {
  if (useInMemory) return res.json(dbMemory.visarjan_slots);
  try {
    const result = await pool.query(`
      SELECT vs.*, p.name as pandal_name 
      FROM visarjan_slots vs 
      JOIN pandals p ON vs.pandal_id = p.id 
      ORDER BY vs.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visarjan-slots', async (req, res) => {
  const { pandal_id, location_ghat, immersion_type, slot_time, vehicle_type, status } = req.body;
  if (!pandal_id || !location_ghat || !immersion_type || !slot_time || !vehicle_type) {
    return res.status(400).json({ error: 'Missing required visarjan slot fields' });
  }

  if (useInMemory) {
    const newSlot = {
      id: dbMemory.nextIds.visarjan_slots++,
      pandal_id: parseInt(pandal_id, 10),
      location_ghat,
      immersion_type,
      slot_time,
      vehicle_type,
      status: status || 'Scheduled',
      created_at: new Date().toISOString()
    };
    dbMemory.visarjan_slots.unshift(newSlot);
    return res.status(201).json(newSlot);
  }

  try {
    const result = await pool.query(
      `INSERT INTO visarjan_slots (pandal_id, location_ghat, immersion_type, slot_time, vehicle_type, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [pandal_id, location_ghat, immersion_type, slot_time, vehicle_type, status || 'Scheduled']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/visarjan-slots/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (useInMemory) {
    const slot = dbMemory.visarjan_slots.find(v => v.id === id);
    if (!slot) return res.status(404).json({ error: 'Visarjan slot not found' });
    if (status) slot.status = status;
    return res.json(slot);
  }

  try {
    const result = await pool.query(
      'UPDATE visarjan_slots SET status = COALESCE($1, status) WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Visarjan slot not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/visarjan-slots/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (useInMemory) {
    const idx = dbMemory.visarjan_slots.findIndex(v => v.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Visarjan slot not found' });
    dbMemory.visarjan_slots.splice(idx, 1);
    return res.json({ message: 'Visarjan slot deleted successfully' });
  }

  try {
    const result = await pool.query('DELETE FROM visarjan_slots WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Visarjan slot not found' });
    res.json({ message: 'Visarjan slot deleted successfully' });
  } catch (err) {
    res.status(500).