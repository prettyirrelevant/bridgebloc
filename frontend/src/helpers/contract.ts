const getDomain = (chain: string) => {
  if (!chain) return;

  const domain = chain.startsWith('ethereum')
    ? 0
    : chain.startsWith('optimism')
      ? 2
      : chain.startsWith('arbitrum_one')
        ? 3
        : chain.startsWith('base')
          ? 6
          : chain.startsWith('polygon_pos')
            ? 7
            : null;

  if (domain === null) throw new Error('Invalid Chain for CCTP');
  return domain;
};

export { getDomain };
