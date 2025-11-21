import React from "react";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";
import type { AuctionSummary } from "../types";

interface CarCardProps {
  auction: AuctionSummary;
}

const CarCard: React.FC<CarCardProps> = ({ auction }) => {
  return (
    <article className="car-card">
      <Link to={`/auctions/${auction.id}`} className="car-card-image-wrap">
        <img src={auction.imageUrl} alt={auction.title} className="car-card-image" />
        <span className={`status-badge status-${auction.status}`}>
          {auction.status.toUpperCase()}
        </span>
      </Link>

      <div className="car-card-body">
        <header className="car-card-header">
          <h2 className="car-title">
            <Link to={`/auctions/${auction.id}`}>{auction.title}</Link>
          </h2>
          <span className="car-subtitle">
            {auction.year} · {auction.make} {auction.model}
          </span>
        </header>

        <div className="car-meta-row">
          <div className="car-meta-col">
            <span className="label">Current bid</span>
            <span className="value">
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
