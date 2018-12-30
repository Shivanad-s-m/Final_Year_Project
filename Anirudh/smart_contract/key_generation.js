
var crypto = require('crypto');


class user
{
   

    constructor()
    {
        this.pri_key = undefined
        this.pub_key = undefined

    }
    generate_keys()
    {
        
        var prime_length = 60;
        var diffHell = crypto.createDiffieHellman(prime_length);
        diffHell.generateKeys('base64');


        this.pub_key =diffHell.getPublicKey('hex')
        this.pri_key =diffHell.getPrivateKey('hex')
    
        //with base64 encoding
        //this.pub_key =diffHell.getPublicKey('base64')
        //this.pri_key =diffHell.getPrivateKey('base64')

        console.log(typeof(diffHell.getPublicKey('hex')),this.pub_key , this.pri_key)
    }


}
let user1 = new user()
user1.generate_keys()
