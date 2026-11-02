import React from 'react';
import Badge from './Badge';

export default function TariffBadge({ rate = 0, isFTA = false, ftaName = 'CEPA' }) {
  if (isFTA || rate === 0) {
    return (
      <Badge variant="success" size="xs">
        0% Preferential ({ftaName})
      </Badge>
    );
  }
  return (
    <Badge variant="navy" size="xs">
      {rate}% MFN Standard
    </Badge>
  );
}
