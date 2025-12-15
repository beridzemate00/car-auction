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
    if (!id) {
      setError("Invalid auction id.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
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
    return (
      <div className="page" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading auction details...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <h3>{error ?? "Auction not found"}</h3>
          <p>The auction you're looking for doesn't exist or has been removed.</p>
          <button className="btn" onClick={() => navigate("/")}>
            ← Browse Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-detail">
      {/* Header with back button and status */}
      <div className="detail-header" style={{ marginBottom: '1.5rem' }}>
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          ← Back to listings
        </button>
        <span className={`status-badge status-${car.status}`} style={{ position: 'static' }}>
          {car.status === 'live' ? '🔴 LIVE' : car.status === 'upcoming' ? '🟡 UPCOMING' : '⚪ SOLD'}
        </span>
      </div>

      <div className="detail-layout">
        {/* Image Column */}
        <div className="detail-image-col">
          <img src={car.imageUrl} alt={car.title} className="detail-image" />

          {/* Quick Info Pills */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginTop: '1rem'
          }}>
            <span style={{
              background: 'var(--gray-100)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              📍 {car.location}
            </span>
            <span style={{
              background: 'var(--gray-100)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              🛣️ {car.mileage.toLocaleString()} km
            </span>
            {car.damage && (
              <span style={{
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                color: 'var(--error)'
              }}>
                ⚠️ {car.damage}
              </span>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="detail-info-col">
          <h1 className="detail-title">{car.title}</h1>
          <p className="detail-subtitle">
            {car.year} · {car.make} {car.model}
          </p>

          {/* Price Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: car.buyNowPrice ? '1fr 1fr' : '1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.05))',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(37, 99, 235, 0.2)'
            }}>
              <span className="label">Current Bid</span>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--primary)',
                marginTop: '0.25rem'
              }}>
                ${car.currentBid.toLocaleString("en-US")}
              </div>
            </div>

            {car.buyNowPrice && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <span className="label">Buy Now Price</span>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--secondary)',
                  marginTop: '0.25rem'
                }}>
                  ${car.buyNowPrice.toLocaleString("en-US")}
                </div>
              </div>
            )}
          </div>

          {/* Timer */}
          <div style={{
            background: 'var(--gray-50)',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              ⏱️ Time Remaining
            </span>
            <CountdownTimer endsAt={car.endsAt} />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            {car.status === 'live' && (
              <>
                <button className="btn" style={{ flex: 1 }}>
                  🏷️ Place Bid
                </button>
                {car.buyNowPrice && (
                  <button className="btn btn-success" style={{ flex: 1 }}>
                    ⚡ Buy Now
                  </button>
                )}
              </>
            )}
            {car.status === 'upcoming' && (
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                🔔 Notify Me When Live
              </button>
            )}
            {car.status === 'sold' && (
              <button className="btn btn-secondary" style={{ flex: 1 }} disabled>
                This auction has ended
              </button>
            )}
          </div>

          {/* Note */}
          <div className="detail-note">
            💡 This is a demo auction. Bidding functionality will be added in future updates.
          </div>

          <Link to="/" className="btn-ghost" style={{ display: 'inline-block' }}>
            ← Browse more auctions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
