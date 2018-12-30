var crypto = require('crypto');

var prompt = require('prompt');
//var async = require("async");
var readline = require('readline-sync');

class user
{
   

    constructor()
    {
        this.pri_key = undefined
        this.pub_key = undefined
        this.fullname=undefined
        this.email=undefined
        this.password=undefined
        this.mobile=undefined
    }
   
    verification()
    {
        this.fullname = readline.question("your name?")
        this.mobile = readline.question("mobile no ?")
        console.log(this.fullname , this.mobile)
        
       //verify name and mobile number , adhar and otp verification
       
        


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

user1.verification()

user1.generate_keys()

