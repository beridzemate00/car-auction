DELETE FROM bids;
DELETE FROM auctions;
DELETE FROM cars;

INSERT INTO cars (title, make, model, year, mileage, location, image_url, damage)
VALUES
  ('2018 BMW 3 Series', 'BMW', '320i', 2018, 85000, 'Berlin, DE',
   'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg', 'front'),
  ('2016 Toyota Corolla', 'Toyota', 'Corolla', 2016, 120000, 'Warsaw, PL',
   'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg', 'rear'),
  ('2020 Tesla Model 3', 'Tesla', 'Model 3', 2020, 40000, 'Paris, FR',
   'https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg', 'none');

INSERT INTO auctions (car_id, status, current_bid, buy_now_price, ends_at)
VALUES
  (1, 'live',     5200,  8000, NOW() + INTERVAL '6 hours'),
  (2, 'upcoming', 2300,  NULL, NOW() + INTERVAL '24 hours'),
  (3, 'sold',    18000, 24000, NOW() - INTERVAL '5 hours');

INSERT INTO bids (auction_id, bidder_name, amount)
VALUES
  (1, 'John Doe', 5400),
  (1, 'Jane Smith', 5600),
  (3, 'Demo User', 18000);
