const constrictAddress = (address: string, range1 = 5, range2 = 5) => {
  return address
    ? `${address?.slice(0, range1)}...${address?.slice(-range2)}`
    : "";
};

const formatIpfsLink = (url: string) => {
  return url.includes("ipfs://")
    ? "https://ipfs.io/ipfs/" + url.split("ipfs://")[1]
    : url;
};

export { formatIpfsLink, constrictAddress };
