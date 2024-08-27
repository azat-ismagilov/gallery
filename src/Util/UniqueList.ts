const UniqueList = <T, K>(list: T[], key: (v: T) => K = (v: T): K => v as unknown as K): T[] => {
  const onlyUnique = (value: T, index: number, self: T[]): boolean =>
    self.findIndex((item) => key(item) === key(value)) === index;

  return list.filter(onlyUnique);
};

export default UniqueList;
