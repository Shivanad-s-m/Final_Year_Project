var crypto = require('crypto');

var prompt = require('prompt');
//var async = require("async");
var readline = require('readline-sync');

class user
{
   

    constructor()
    {
        this.uid=undefined;//permanent user id
        this.pri_key = undefined
        this.pub_key = undefined
        this.fullname=undefined
        this.email=undefined
        this.password=undefined
        this.mobile=undefined
        this.balance=undefined
        
    }
   
    user_verification()
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
    wallet_setup()
    {
        user1.generate_keys()
        this.balance = 10000 // get from external sources
        
    }

    add_property()
    {

        var survey_no = readline.question("survey no")
        var hissa_no = readline.question("hissa no ")
        var dist = readline.question("district")
        var taluk =readline.question("taluk")
        var hobli = readline.question("hobli")
        var village = readline.question("village")

        //verify propery
        if(true)
        {
            console.log("property is legit and appended to blockchain")  //append block to block chain  or genesis transaction
            //add_block(uid,survey_no,hissano,dist,taluk,hobli,village) //uid is permanent owner id
        }
        



    }

}
let user1 = new user()

user1.user_verification()



user1.wallet_setup()

//user1.generate_keys()  //to change keys if user wishes

//transaction interface - make, peer id = public key ,so transactions can go to that id



user1.add_property()
