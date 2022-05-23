const { buildBabyjub, buildPedersenHash } = require('circomlibjs');

const ffjavascriptUtils = require("ffjavascript").utils;
const { leInt2Buff, leBuff2int } = ffjavascriptUtils;

const uint8ArrayToBn = (arr) => {
  var hex = [];

  arr.forEach((i) => {
    var h = i.toString(16);
    if (h.length % 2) { h = '0' + h; }
    hex.push(h);
  });

  return BigInt('0x' + hex.join(''));
}

const pedersenHash = async (val) => {
  const pedersen = await buildPedersenHash();
  const babyJub = await buildBabyjub();
  const buff = leInt2Buff(val, 32)
  const hashed = pedersen.hash(buff)
  const result = babyJub.unpackPoint(hashed)
  const encodedHash = encodePedersen(result)

  return {
    encodedHash,
    babyJubX: result[0],
    babyJubY: result[1],
  }
}

const encodePedersen = (unpackedPoint) => {
  const xBuff = leInt2Buff(uint8ArrayToBn(unpackedPoint[0]), 32)
  const yBuff = leInt2Buff(uint8ArrayToBn(unpackedPoint[1]), 32)

  const result = Buffer.alloc(32)

  result[31] = xBuff[31];

  for (let i = 0; i < 31; i++) {
    result[i] = yBuff[i];
  }
  return leBuff2int(result, 32)
}

if (require.main === module) {
  const input = BigInt(process.argv[2])
  const hash = pedersenHash(input).encodedHash.toString()
  console.log(hash)
}


module.exports = { pedersenHash }