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

export const BITCOIN_NETWORK_TO_MAGIC: Record<BitcoinNetworks, string> = {
  [BitcoinNetworks.MAINNET]: 'f9beb4d9',
  [BitcoinNetworks.TESTNET]: 'fabfb5da',
};

export const BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX: Record<
  BitcoinNetworks,
  string
> = {
  [BitcoinNetworks.MAINNET]: 'bc',
  [BitcoinNetworks.TESTNET]: 'tb',
};
