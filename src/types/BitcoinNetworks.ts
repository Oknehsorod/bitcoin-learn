export enum BitcoinNetworks {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
  REGTEST = 'REGTEST',
}

export const BITCOIN_NETWORK_TO_ADDRESS_PREFIX: Record<
  BitcoinNetworks,
  string
> = {
  [BitcoinNetworks.MAINNET]: '00',
  [BitcoinNetworks.TESTNET]: '6f',
  [BitcoinNetworks.REGTEST]: '6f',
};

export const BITCOIN_NETWORK_TO_WIF_PREFIX: Record<BitcoinNetworks, string> = {
  [BitcoinNetworks.MAINNET]: '80',
  [BitcoinNetworks.TESTNET]: 'ef',
  [BitcoinNetworks.REGTEST]: 'ef',
};

export const BITCOIN_NETWORK_TO_SH_PREFIX: Record<BitcoinNetworks, string> = {
  [BitcoinNetworks.MAINNET]: '05',
  [BitcoinNetworks.TESTNET]: 'c4',
  [BitcoinNetworks.REGTEST]: 'c4',
};

export const BITCOIN_NETWORK_TO_MAGIC: Record<BitcoinNetworks, string> = {
  [BitcoinNetworks.MAINNET]: 'f9beb4d9',
  [BitcoinNetworks.TESTNET]: 'fabfb5da',
  [BitcoinNetworks.REGTEST]: 'fabfb5da',
};

export const BITCOIN_NETWORK_TO_WITNESS_ADDRESS_PREFIX: Record<
  BitcoinNetworks,
  string
> = {
  [BitcoinNetworks.MAINNET]: 'bc',
  [BitcoinNetworks.TESTNET]: 'tb',
  [BitcoinNetworks.REGTEST]: 'bcrt',
};

export const BITCOIN_NETWORK_TO_PRIVATE_HD_KEY: Record<
  BitcoinNetworks,
  string
> = {
  [BitcoinNetworks.MAINNET]: '0488ADE4',
  [BitcoinNetworks.TESTNET]: '04358394',
  [BitcoinNetworks.REGTEST]: '04358394',
};

export const BITCOIN_NETWORK_TO_PUBLIC_HD_KEY: Record<BitcoinNetworks, string> =
  {
    [BitcoinNetworks.MAINNET]: '0488B21E',
    [BitcoinNetworks.TESTNET]: '043587CF',
    [BitcoinNetworks.REGTEST]: '043587CF',
  };
