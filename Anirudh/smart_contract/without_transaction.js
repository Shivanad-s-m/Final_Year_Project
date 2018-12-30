var crypto = require('crypto');

var prompt = require('prompt');
//var async = require("async");
var readline = require('readline-sync');

var  property_lock = {}

function send_money(pub_key,price)  //as users wallet stored in separate database ,its a db operation 
{

//send money to owner by some protocol


}

class user //users info is stored in separate db ,it can be simulated using class ,only transactions are stored in blockchain
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

    buy_property()
    {
        //query_miner
        //query by id or hissa_no or survey no or any relavant combination
        prop_id,owners_pubkey,survey_no,hissa_no,dist,taluk,pubkey,price = query_miner(prop_id);
        //hash_map for lock 
        if(property_lock[prop_id]==1)
        {
            console.log("some other transaction is occuring with respect to this property right now")
            console.log("come back later")

        }
        else
        {
            property_lock[prop_id] = "1" //  if 1 

            //start transaction
            //subtract price of property from user while buying
            if(this.balance>price)
            {
                this.balance= this.balance - price
                send_money(owners_pubkey,price)

                //If new price to be set
                var new_price =99999;
                for (let id in peers) {
                    peers[id].conn.write('u'+this.pub_key,prop_id,survey_no,hissa_no,dist,taluk,new_price)
                    //append to blockchain with buyer's pubkey and new price
                }

                delete property_lock[prop_id]
                //transaction complete


            }
            else
            {
                delete property_lock[prop_id]
                //EXIT TRANSACTION
            }

        }
    }

    query_property_details()
    {

        //query_miner
        //query by id or hissa_no or survey no or any relavant combination
        prop_id,survey_no,hissa_no,dist,taluk,price = query_miner(prop_id);


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
        var prop_id= crypto.randomBytes(32)
        var survey_no = readline.question("survey no")
        var hissa_no = readline.question("hissa no ")
        var dist = readline.question("district")
        var taluk =readline.question("taluk")
        var hobli = readline.question("hobli")
        var village = readline.question("village")
        var price = 100000;
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

user1.buy_property()
