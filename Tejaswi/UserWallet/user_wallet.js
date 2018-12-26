var crypto = require("crypto");
var eccrypto = require("eccrypto");
var generateRSAKeypair = require('generate-rsa-keypair') 

class UserWallet
{
    constructor(){
        //RSA - (pvtKey, pubKey) pair
        var pair = generateRSAKeypair()
        this.private_key = pair.private
        this.public_key = pair.public
        //Randomly initialize user balance - simulation of buying bitcoins
        this.user_balance = Math.floor(Math.random() * 100);
    }
    Create_Signature(data){
        const signer = crypto.createSign('sha256');
        signer.update(data);
        signer.end();
        const signature = signer.sign(this.private_key)
        return signature
    }
    Verify_Signature(data, signature){
        const verifier = crypto.createVerify('sha256');
        verifier.update(data);
        verifier.end();
        const verified = verifier.verify(this.public_key, signature);
        return verified
    }
    Display() {
        console.log("User details\n------------")
        //console.log('> Private key: ', this.privateKey.toString('hex'));
        console.log('> Public key: ', this.public_key.toString());
        console.log('> Balance: ', this.user_balance.toString()+'\n');
    }
}



//let u1 = new UserWallet()
//u1.Display()

/*
Demo for create and verify signature
------------------------------------
const message = "hello there!"
let signature = u1.Create_Signature(message)
const signature_hex = signature.toString('hex')
let verified = u1.Verify_Signature(message, signature)
console.log(JSON.stringify({
    message:message,
    signature:signature_hex,
    verified:verified
}))
*/
