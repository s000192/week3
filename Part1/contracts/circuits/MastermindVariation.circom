pragma circom 2.0.0;

include "./pedersenhash.circom";

// [assignment] implement a variation of mastermind from https://en.wikipedia.org/wiki/Mastermind_(board_game)#Variation as a circuit
// A variation that consists of 5 holes instead of 4 holes
template MastermindVariation() {
    // Public inputs
    signal input pubGuess[5];
    signal input pubNumBlacks;
    signal input pubNumWhites;
    signal input pubSolnHash;

    // Private inputs: the solution to the puzzle
    signal input privSoln[5];

    signal input privSaltedSoln;

    // Output
    signal output solnHashOut;

    var nb = 0;

    var guess[5];
    var soln[5];

    // Count black pegs
    for (var i=0; i<5; i++) {
        if (pubGuess[i] == privSoln[i]) {
            nb++;
            // Set matching pegs to 0
            guess[i] = 0;
            soln[i] = 0;
        } else {
            guess[i] = pubGuess[i];
            soln[i] = privSoln[i];
        }
    }
    var nw = 0;

    // Count white pegs
    // block scope isn't respected, so k and j have to be declared outside
    var k = 0;
    var j = 0;
    for (j=0; j<5; j++) {
        for (k=0; k<5; k++) {
            // the && operator doesn't work
            if (j != k) {
                if (guess[j] == soln[k]) {
                    if (guess[j] > 0) {
                        nw++;
                        // Set matching pegs to 0
                        guess[j] = 0;
                        soln[k] = 0;
                    }
                }
            }
        }
    }

    assert(nb == pubNumBlacks);
    assert(nw == pubNumWhites);

    // Verify that the hash of the private solution matches pubSolnHash
    // via a constraint that the publicly declared solution hash matches the
    // private solution witness

    component pedersen = PedersenHashSingle();
    pedersen.in <== privSaltedSoln;

    solnHashOut <== pedersen.encoded;
    pubSolnHash === pedersen.encoded;
}

component main = MastermindVariation();