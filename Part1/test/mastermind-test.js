//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");
const { unstringifyBigInts, genSolnInput, genSalt } = require("./utils");
const { pedersenHash } = require('./pedersen');
const wasm_tester = require("circom_tester").wasm;
const assert = chai.assert;

describe("Modified Mastermind test", function () {
  this.timeout(100000000);

  it("modified mastermind circuit", async () => {
    const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
    await circuit.loadConstraints();

    const testCases = [
      {
        "guess": [1, 2, 2, 1, 1],
        "soln": [2, 2, 1, 2, 2],
        "whitePegs": 2,
        "blackPegs": 1,
      },
      {
        "guess": [1, 2, 2, 1, 3],
        "soln": [1, 2, 1, 2, 3],
        "whitePegs": 2,
        "blackPegs": 3,
      },
      {
        "guess": [1, 3, 3, 3, 2],
        "soln": [3, 3, 3, 3, 1],
        "whitePegs": 0,
        "blackPegs": 3,
      },
      {
        "guess": [2, 2, 1, 1, 4],
        "soln": [2, 2, 2, 2, 4],
        "whitePegs": 0,
        "blackPegs": 3,
      },
      {
        "guess": [3, 1, 3, 4, 5],
        "soln": [4, 3, 2, 3, 5],
        "whitePegs": 3,
        "blackPegs": 1,
      },
      {
        "guess": [1, 2, 3, 4, 4],
        "soln": [4, 3, 2, 1, 2],
        "whitePegs": 4,
        "blackPegs": 0,
      },
      {
        "guess": [1, 1, 1, 1, 5],
        "soln": [4, 3, 2, 1, 4],
        "whitePegs": 0,
        "blackPegs": 1,
      }
    ]

    for (let testCase of testCases) {
      const soln = genSolnInput(testCase.soln)
      const saltedSoln = soln + genSalt()
      const hashedSoln = await pedersenHash(saltedSoln)

      const testInput = {
        pubNumBlacks: testCase.blackPegs,
        pubNumWhites: testCase.whitePegs,

        pubSolnHash: hashedSoln.encodedHash.toString(),
        privSaltedSoln: saltedSoln.toString(),

        pubGuess: testCase.guess,
        privSoln: testCase.soln,
      }

      console.log('diu')
      console.log(testInput)
      const witness = await circuit.calculateWitness(testInput, true)
      console.log('WTF')
      console.log(witness)
      console.log('NB calculated by circuit:', witness[circuit.getSignalIdx('main.pubNumBlacks')])
      assert(witness[circuit.getSignalIdx('main.pubNumBlacks')].toString() === testCase.blackPegs.toString())

      console.log('NW calculated by circuit:', witness[circuit.getSignalIdx('main.pubNumWhites')])
      assert(witness[circuit.getSignalIdx('main.pubNumWhites')].toString() === testCase.whitePegs.toString())

      console.log('Hash calculated by circuit:',
        witness[circuit.getSignalIdx('main.solnHashOut')].toString(16))

      console.log('Hash calculated by JS     :', hashedSoln.encodedHash.toString(16))

      assert(hashedSoln.encodedHash.toString() === witness[circuit.getSignalIdx('main.solnHashOut')].toString())
    }
  })
});
