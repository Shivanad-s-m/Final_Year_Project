var crypto = require("crypto");
var eccrypto = require("eccrypto");

class UserWallet
{
    constructor(){
        // A new random 32-byte private key.
        this.privateKey = crypto.randomBytes(32);
        // Corresponding uncompressed (65-byte) public key.
        this.publicKey = eccrypto.getPublic(this.privateKey);
        //Randomly initialize user balance - simulation of buying bitcoins
        this.user_balance = Math.floor(Math.random() * 100);
    }
    Display() {
        console.log("User details\n------------")
        //console.log('> Private key: ', this.privateKey.toString('hex'));
        console.log('> Public key: ', this.publicKey.toString('hex'));
        console.log('> Balance: ', this.user_balance.toString()+'\n');
    }
}

let u1 = new UserWallet()
u1.Display()
