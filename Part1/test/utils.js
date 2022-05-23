const crypto = require('crypto');
const leBuff2int = require("ffjavascript").utils.leBuff2int;

const unstringifyBigInts = (o) => {
  if ((typeof (o) === "string") && (/^[0-9]+$/.test(o))) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o === "object") {
    const res = {};
    for (let k in o) {
      res[k] = unstringifyBigInts(o[k]);
    }
    return res;
  } else {
    return o;
  }
}

const stringifyBigInts = (o) => {
  //@ts-ignore TS2365
  if ((typeof (o) == "bigint") || (o instanceof BigInt)) {
    return o.toString(10);
  } else if (Array.isArray(o)) {
    return o.map(stringifyBigInts);
  } else if (typeof o === "object") {
    const res = {};
    for (let k in o) {
      res[k] = stringifyBigInts(o[k]);
    }
    return res;
  } else {
    return o;
  }
}

const genSolnInput = (soln) => {
  let m = BigInt(0)

  for (let i = soln.length - 1; i >= 0; i--) {
    m = m + BigInt(soln[i] * (4 ** i))
  }

  return m
}

const genSalt = () => {
  // the maximum integer supported by Solidity is (2 ^ 256), which is 32
  // bytes long
  const buf = crypto.randomBytes(30)
  const salt = leBuff2int(buf) - BigInt(340)

  // 4 * (4^3) + 4 * (4^2) + 4 * (4^1) + 4 * (4^0) = 340
  // Only return values greater than the largest possible solution
  if (salt < BigInt(340)) {
    return genSalt()
  }

  return salt
}

module.exports = { unstringifyBigInts, stringifyBigInts, genSolnInput, genSalt }