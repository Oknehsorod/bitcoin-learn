import { createAddress } from './utils/createAddress';
import { BitcoinNetworks } from './types/BitcoinNetworks';
import { getSECPublicKey } from './utils/getSECPublicKey';
import { getPublicKey } from './utils/getPublicKey';

const secretKey = 84587027342324992384834787429n;

const address = createAddress(
  BitcoinNetworks.TESTNET,
  getSECPublicKey(getPublicKey(secretKey), true),
);

console.log(address);
