// client/src/pages/CarDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAuctionById } from "../api/auctions";
import type { AuctionSummary } from "../types";
import CountdownTimer from "../components/CountdownTimer";

const CarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<AuctionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // если почему-то нет id — просто не грузим
    if (!id) {
      setError("Invalid auction id.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        // тут важно: id! → говорим TS, что id точно есть
        const data = await getAuctionById(id!);
        if (!cancelled) {
          setCar(data.car);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Failed to load auction");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p>Loading auction...</p>;
  }

  if (error || !car) {
    return (
      <div className="page">
        <p className="error-text">{error ?? "Auction not found."}</p>
        <button className="btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="page page-detail">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className={`status-badge status-${car.status}`}>
          {car.status.toUpperCase()}
        </span>
      </div>

      <div className="detail-layout">
        <div className="detail-image-col">
          <img src={car.imageUrl} alt={car.title} className="detail-image" />
        </div>

        <div className="detail-info-col">
          <h1 className="detail-title">{car.title}</h1>
          <p className="detail-subtitle">
            {car.year} · {car.make} {car.model}
          </p>

          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <span className="label">Current bid</span>
              <span className="value big">
                ${car.currentBid.toLocaleString("en-US")}
              </span>
            </div>

            {car.buyNowPrice && (
              <div className="detail-meta-item">
                <span className="label">Buy now</span>
                <span className="value big buy-now">
                  ${car.buyNowPrice.toLocaleString("en-US")}
                </span>
              </div>
            )}

            <div className="detail-meta-item">
              <span className="label">Mileage</span>
              <span className="value">
                {car.mileage.toLocaleString("en-US")} km
              </span>
            </div>

            <div className="detail-meta-item">
              <span className="label">Location</span>
              <span className="value">{car.location}</span>
            </div>

            <div className="detail-meta-item">
              <span className="label">Time left</span>
              <CountdownTimer endsAt={car.endsAt} />
            </div>

            <div className="detail-meta-item">
              <span className="label">Damage</span>
              <span className="value">{car.damage || "—"}</span>
            </div>
          </div>

          <p className="detail-note">
            This is a demo read-only auction. In the next step we can add bidding and
            user-submitted cars.
          </p>

          <Link to="/" className="btn">
            Back to all auctions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
