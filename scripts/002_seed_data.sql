-- Seed Data for Ticketing Platform

-- Insert User Types
INSERT INTO user_types (name, description, discount_percentage) VALUES
  ('Regular', 'Standard user with no special benefits', 0),
  ('Premium', 'Premium member with 10% discount', 10),
  ('VIP', 'VIP member with 20% discount and priority access', 20),
  ('Student', 'Student discount of 15%', 15)
ON CONFLICT (name) DO NOTHING;

-- Insert Ticket Types
INSERT INTO ticket_types (name, description, price_multiplier) VALUES
  ('General Admission', 'Standard entry ticket', 1.0),
  ('VIP', 'VIP seating with premium view', 2.0),
  ('Backstage Pass', 'Includes backstage access and meet & greet', 3.5),
  ('Early Bird', 'Discounted early purchase ticket', 0.8)
ON CONFLICT DO NOTHING;

-- Insert Venues
INSERT INTO venues (name, address, city, capacity) VALUES
  ('Madison Square Garden', '4 Pennsylvania Plaza', 'New York', 20000),
  ('The O2 Arena', 'Peninsula Square', 'London', 20000),
  ('Staples Center', '1111 S Figueroa St', 'Los Angeles', 19000),
  ('Red Rocks Amphitheatre', '18300 W Alameda Pkwy', 'Morrison, CO', 9500),
  ('Sydney Opera House', 'Bennelong Point', 'Sydney', 5700)
ON CONFLICT DO NOTHING;

-- Insert Sample Concerts
INSERT INTO concerts (name, artist, description, venue_id, date, base_price, total_tickets, available_tickets, status)
SELECT 
  'Summer Vibes Tour',
  'The Weeknd',
  'An electrifying summer concert experience with chart-topping hits',
  v.id,
  NOW() + INTERVAL '30 days',
  85.00,
  5000,
  4250,
  'upcoming'
FROM venues v WHERE v.name = 'Madison Square Garden'
ON CONFLICT DO NOTHING;

INSERT INTO concerts (name, artist, description, venue_id, date, base_price, total_tickets, available_tickets, status)
SELECT 
  'Midnight Dreams',
  'Taylor Swift',
  'A magical evening of music and storytelling',
  v.id,
  NOW() + INTERVAL '45 days',
  120.00,
  8000,
  6500,
  'upcoming'
FROM venues v WHERE v.name = 'The O2 Arena'
ON CONFLICT DO NOTHING;

INSERT INTO concerts (name, artist, description, venue_id, date, base_price, total_tickets, available_tickets, status)
SELECT 
  'Rock Revolution',
  'Foo Fighters',
  'High-energy rock concert featuring classic and new hits',
  v.id,
  NOW() + INTERVAL '15 days',
  75.00,
  6000,
  2800,
  'upcoming'
FROM venues v WHERE v.name = 'Staples Center'
ON CONFLICT DO NOTHING;

INSERT INTO concerts (name, artist, description, venue_id, date, base_price, total_tickets, available_tickets, status)
SELECT 
  'Acoustic Sunset',
  'Ed Sheeran',
  'Intimate acoustic performance under the stars',
  v.id,
  NOW() + INTERVAL '60 days',
  95.00,
  4000,
  3800,
  'upcoming'
FROM venues v WHERE v.name = 'Red Rocks Amphitheatre'
ON CONFLICT DO NOTHING;

INSERT INTO concerts (name, artist, description, venue_id, date, base_price, total_tickets, available_tickets, status)
SELECT 
  'Classical Fusion',
  'Hans Zimmer',
  'A symphonic journey through iconic film scores',
  v.id,
  NOW() - INTERVAL '5 days',
  150.00,
  3000,
  0,
  'completed'
FROM venues v WHERE v.name = 'Sydney Opera House'
ON CONFLICT DO NOTHING;

-- Insert Default Settings
INSERT INTO settings (key, value, description) VALUES
  ('site_name', 'ConcertHub Admin', 'Name of the ticketing platform'),
  ('currency', 'USD', 'Default currency for transactions'),
  ('tax_rate', '8.5', 'Tax rate percentage'),
  ('booking_fee', '5.00', 'Fixed booking fee per transaction'),
  ('max_tickets_per_booking', '10', 'Maximum tickets allowed per booking'),
  ('refund_window_hours', '48', 'Hours before concert when refunds are allowed')
ON CONFLICT (key) DO NOTHING;
