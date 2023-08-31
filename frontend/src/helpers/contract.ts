const getDomain = (chain: string) => {
  if (!chain) return;

  const domain = chain.startsWith("ethereum")
    ? 0
    : chain.startsWith("avalanche")
    ? 1
    : chain.startsWith("arbitrum_one")
    ? 3
    : null;

  if (domain === null) throw new Error("Invalid Chain for CCTP");
  return domain;
};

export { getDomain };
