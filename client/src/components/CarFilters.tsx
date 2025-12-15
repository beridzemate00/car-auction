// client/src/components/CarFilters.tsx
import React from "react";

interface CarFiltersProps {
  search: string;
  status: "all" | "live" | "upcoming" | "sold";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | "live" | "upcoming" | "sold") => void;
}

const CarFilters: React.FC<CarFiltersProps> = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className="filters-bar">
      <div style={{ position: 'relative', flex: '1 1 300px' }}>
        <span style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '1.1rem',
          opacity: 0.5
        }}>
          🔍
        </span>
        <input
          className="filters-search"
          type="text"
          placeholder="Search by make, model, or title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: '2.75rem' }}
        />
      </div>

      <select
        className="filters-select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as CarFiltersProps["status"])}
      >
        <option value="all">📋 All Statuses</option>
        <option value="live">🟢 Live Auctions</option>
        <option value="upcoming">🟡 Upcoming</option>
        <option value="sold">🔴 Sold</option>
      </select>
    </div>
  );
};

export default CarFilters;
