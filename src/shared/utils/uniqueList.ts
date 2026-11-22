const UniqueList = <T, K = T>(
  list: readonly T[],
  key: (item: T) => K = (v) => v as unknown as K,
): T[] => {
  const seen = new Set<K>();
  return list.filter((value) => {
    const k = key(value);
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });
};

export default UniqueList;
