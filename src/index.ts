import { createP2WPKHAddress } from './utils/createP2WPKHAddress';
import { BitcoinNetworks } from './types/BitcoinNetworks';
import { getPublicKey } from './utils/getPublicKey';
import { encodeSEC } from './formats/sec';
import { encodeP2PKH } from './formats/address/p2pkh';
import { hash160 } from './utils/hash160';

const secret = 1n;

const address = encodeP2PKH(
  BitcoinNetworks.REGTEST,
  encodeSEC(getPublicKey(secret), true),
);

console.log(
  address,
  hash160(encodeSEC(getPublicKey(secret), true)).toString('hex'),
);

// const tx = new Transaction()
//   .addInput({
//     previousTransactionID:
//       '489302fc5c4a745271331149937222f40bd6bc98c414806255cab53d3473f70d',
//     previousTransactionOutputIndex: 0,
//   })
//   .addOutput({
//     amount: btcToSatoshi(50) - 1000n,
//     scriptPublicKey: script.fromASM(
//       `0 06afd46bcdfd22ef94ac122aa11f241244a37ecc`,
//     ),
//   });

console.log('Address: ', address);
