import React from "react";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";
import type { AuctionSummary } from "../types";

interface CarCardProps {
  auction: AuctionSummary;
}

// Check if auction ends within a given number of hours
function isEndingSoon(endsAt: string, hours: number = 2): boolean {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;
  return diff > 0 && diff <= hours * 60 * 60 * 1000;
}

const CarCard: React.FC<CarCardProps> = ({ auction }) => {
  const showHotDeal = auction.status === 'live' && isEndingSoon(auction.endsAt, 2);

  return (
    <article className="car-card">
      <Link to={`/auctions/${auction.id}`} className="car-card-image-wrap">
        <img src={auction.imageUrl} alt={auction.title} className="car-card-image" />
        <span className={`status-badge status-${auction.status}`}>
          {auction.status === 'live' ? '🔴 LIVE' : auction.status.toUpperCase()}
        </span>
        {showHotDeal && (
          <span className="hot-deal-badge">🔥 Hot Deal</span>
        )}
      </Link>

      <div className="car-card-body">
        <header className="car-card-header">
          <h2 className="car-title">
            <Link to={`/auctions/${auction.id}`}>{auction.title}</Link>
          </h2>
          <span className="car-subtitle">
            {auction.year} · {auction.make} {auction.model}
            {auction.damage && auction.damage !== 'none' && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.15rem 0.5rem',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#b45309',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}>
                ⚠️ {auction.damage} damage
              </span>
            )}
          </span>
        </header>

        <div className="car-meta-row">
          <div className="car-meta-col">
            <span className="label">Current bid</span>
            <span className="value big">
              ${auction.currentBid.toLocaleString("en-US")}
            </span>
          </div>

          {auction.buyNowPrice && (
            <div className="car-meta-col">
              <span className="label">Buy now</span>
              <span className="value buy-now">
                ${auction.buyNowPrice.toLocaleString("en-US")}
              </span>
            </div>
          )}

          <div className="car-meta-col">
            <span className="label">Mileage</span>
            <span className="value">
              {auction.mileage.toLocaleString("en-US")} km
            </span>
          </div>
        </div>

        <div className="car-meta-bottom">
          <span className="location">📍 {auction.location}</span>
          <CountdownTimer endsAt={auction.endsAt} />
        </div>
      </div>
    </article>
  );
};

export default CarCard;
