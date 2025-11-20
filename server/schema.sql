CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  mileage INT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  damage TEXT NOT NULL
);

CREATE TYPE auction_status AS ENUM ('live', 'upcoming', 'sold');

CREATE TABLE auctions (
  id SERIAL PRIMARY KEY,
  car_id INT REFERENCES cars(id) ON DELETE CASCADE,
  status auction_status NOT NULL,
  current_bid NUMERIC NOT NULL,
  buy_now_price NUMERIC,
  ends_at TIMESTAMP NOT NULL
);

CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  auction_id INT REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_name TEXT,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
