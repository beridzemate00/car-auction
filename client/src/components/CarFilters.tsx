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
      <input
        className="filters-search"
        type="text"
        placeholder="Search by make, model, title..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        className="filters-select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as CarFiltersProps["status"])}
      >
        <option value="all">All statuses</option>
        <option value="live">Live</option>
        <option value="upcoming">Upcoming</option>
        <option value="sold">Sold</option>
      </select>
    </div>
  );
};

export default CarFilters;
