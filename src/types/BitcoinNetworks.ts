export enum BitcoinNetworks {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

export const BITCOIN_NETWORK_TO_ADDRESS_PREFIX: Record<
  BitcoinNetworks,
  string
> = {
  [BitcoinNetworks.MAINNET]: '00',
  [BitcoinNetworks.TESTNET]: '6f',
};

export const BITCOIN_NETWORK_TO_WIF_PREFIX: Record<BitcoinNetworks, string> = {
  [BitcoinNetworks.MAINNET]: '80',
  [BitcoinNetworks.TESTNET]: 'ef',
};

export const BITCOIN_NETWORK_TO_SH_PREFIX: Record<BitcoinNetworks, string> = {
  [BitcoinNetworks.MAINNET]: '05',
  [BitcoinNetworks.TESTNET]: 'c4',
};
