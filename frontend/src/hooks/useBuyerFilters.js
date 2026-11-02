import { useState, useMemo } from 'react';

export function useBuyerFilters(buyers = []) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minTrustScore, setMinTrustScore] = useState(0);

  const filteredBuyers = useMemo(() => {
    return buyers.filter(b => {
      const matchSearch = !searchTerm ||
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.industry.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCountry = selectedCountry === 'All' || b.country === selectedCountry;
      const matchVerified = !onlyVerified || b.verified === true;
      const matchScore = (b.score || 0) >= minTrustScore;
      return matchSearch && matchCountry && matchVerified && matchScore;
    });
  }, [buyers, searchTerm, selectedCountry, onlyVerified, minTrustScore]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCountry,
    setSelectedCountry,
    onlyVerified,
    setOnlyVerified,
    minTrustScore,
    setMinTrustScore,
    filteredBuyers
  };
}
