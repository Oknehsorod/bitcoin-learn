import { createP2WPKHAddress } from './utils/createP2WPKHAddress';
import { BitcoinNetworks } from './types/BitcoinNetworks';
import { getPublicKey } from './utils/getPublicKey';
import { encodeSEC } from './formats/sec';

const secret =
  8642247563986041985542494319789474845694841537977676094560668689201580070894n;

const address = createP2WPKHAddress(
  BitcoinNetworks.MAINNET,
  encodeSEC(getPublicKey(secret), true).toString('hex'),
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
