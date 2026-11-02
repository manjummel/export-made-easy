import { useState, useMemo } from 'react';
import { HS_CODE_CATALOG, searchHSCatalog, findHSCode } from '../data/hsCodeDatabase';

export function useHSClassification(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    return searchHSCatalog(query);
  }, [query]);

  const selectCode = (code) => {
    return findHSCode(code);
  };

  return {
    query,
    setQuery,
    results,
    selectCode,
    totalCount: HS_CODE_CATALOG.length
  };
}
