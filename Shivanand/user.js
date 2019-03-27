const crypto = require('crypto')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
var eccrypto = require("eccrypto");
var generateRSAKeypair = require('generate-rsa-keypair')
const readline = require('readline')
const fs = require('fs')

class Client
{
    constructor()
    {
        this.public_key=""
        this.private_key=""
        const path = "./public_key.txt"
        try {
            if (fs.existsSync(path)) {//*for myself* check for private key as well
                console.log("\n\tBooting..\n")
                fs.readFile("public_key.txt", (err,data)=> {
                    this.public_key = data.toString()
                    console.log("Public key fetched from file");
                  });

                fs.readFile("private_key.txt", (err, data)=> {
                    this.private_key = data.toString()
                    console.log("Private key fetched from file");
                  });
            }
            else{
                console.log("Keys do not exist.\n\tCreating new private and public keys..")
                var pair = generateRSAKeypair()
                this.private_key = pair.private
                this.public_key = pair.public
        
                this.private_key = this.private_key.slice(32,-31)
                this.public_key = this.public_key.slice(27,-26)
                
                fs.writeFile("public_key.txt", this.public_key, function(err, data) {
                    if (err) console.log(err);
                    console.log("Successfully saved public key to File.");
                  });
                fs.writeFile("private_key.txt", this.private_key, function(err, data) {
                    if (err) console.log(err);
                    console.log("Successfully saved private key to File.");
                  });
            }
        } catch(err) {
            console.error(err)
        }
        console.log(this.public_key)
        this.config = defaults({id: this.public_key.toString().slice(0,32),})
        this.sw = Swarm(this.config)
        this.sw.listen()
        this.sw.join('miner_channel')
        this.sw.on('connection', (conn, info) => {
            this.connSeq=0
            this.peers = {}
            const seq = this.connSeq
            const peerId = info.id.toString('hex')
            console.log(`Connected #${seq} to peer: ${peerId}`)
            conn.on('close', () => {
                console.log(`Connection ${seq} closed, peer id: ${peerId}`)
                if (this.peers[peerId].seq === seq) {
                    delete this.peers[peerId]
                }
            })
        
            if (!this.peers[peerId]) {
                this.peers[peerId] = {}
            }
            this.peers[peerId].conn = conn
            this.peers[peerId].seq = seq
            this.connSeq++
        })
        
    }
       
    Initialise(json_obj){
        json_obj["pub_key"]=public_key
        conn.write(pubkey)              //Json object sent=>  {type:4,pub_key:string}

        conn.on('data', data =>{            //supposed to receive=>  
                                    //{money:integer, property:[phk1,phk2,...], buyers:[[sl_no,phk,price],[sl_no,phk,price],...]}
            console.log("Account balance:  "+data.money)
            console.log("proerties owned:")
            var total=0
            for(var property in data.property){
                total=total+1
                console.log(property)
            }
            console.log("Total properties owned: "+total)
            
            if(data.hasOwnProperty(buyers)){
                console.log("Interested buyers:")
                for(var buy in data.buyer){
                    console.log("Serial_No: "+buy[0]+"/nProperty: "+buy[1]+"\nPrice: "+buy[2]+"/n---------------/n")
                }
            
            }
            input = undefined
            input =readline.createInterface({
                input: process.stdin,
                output: process.stdout
              })

            input.question("Enter the serial_No of property that you confirm ot sell or enter 0 to reject all:",sl_no=>{
                if(sl_no==0){
                    conn.write({"type":6, "pub_key":public_key})                                                 //object sent=> {"type":6, "pub_key":string} (menans to reject all property transactions for this user)
                }
                conn.write({"type":3, "phk":data.buyer[sl_no][1], "price":data.buyer[sl_no][2]})//*for myself* convert string to integer
                                                                                                                // object sent=>  {"type":3, "phk":string, "price":integer}
                console.log("Transaction sussfully uploaded, refrest for updates.")
            })
            console.log()
        })
         
    }
        
   

    RegisterProp()
    {
        input = undefined
        input =readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        json_obj ={"type":1}
       
        input.question("Enter district: ",inpt=>{
            json_obj["district"]=inpt
        })
        input.question("Enter taluk: ",inpt=>{
            json_obj["taluk"]=inpt
        })

        input.question("Enter hobli: ",inpt=>{
            json_obj["hobli"]=inpt
        })
        
        input.question("Enter hissa_no: ",inpt=>{
            json_obj["hissa_no"]=inpt
        })
        
        input.question("Enter survey_no: ",inpt=>{
            json_obj["survey_no"]=inpt
        })
        
        conn.write(json_obj)            //object sent=> {"type":1, "district":string "taluk":string, "hobli":string, "hissa_no":string, "survey_no":string}
        console.log("Property uploaded for verification. Refresh for updates.")
    }

    Query_property(){
        json_obj={"type":5}

        input = undefined
        input =readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        console.log("Press \"enter key\" to not input any arguments.\n")

        input.question("Enter district: ",inpt=>{
            json_obj["district"]=inpt
        })
        input.question("Enter taluk: ",inpt=>{
            json_obj["taluk"]=inpt
        })

        input.question("Enter hobli: ",inpt=>{
            json_obj["hobli"]=inpt
        })
        
        input.question("Enter hissa_no: ",inpt=>{
            json_obj["hissa_no"]=inpt
        })
        
        input.question("Enter survey_no: ",inpt=>{
            json_obj["survey_no"]=inpt
        })
        conn.write(json_obj)            //object sent=> {"type":1, "district":string "taluk":string, "hobli":string, "hissa_no":string, "survey_no":string}

        console.log("Available properties for given query:")
        conn.on('data',data=>{          //supposed to receive=> {{"phk":string "survey_no":string, "price":integer},{"phk":string "survey_no":string, "price":integer},....} (open for changes)
            for(var prop in data){
                console.log("PHK: "+prop.phk+"/nSurvey number: "+prop.survey_no+"\nPrice: "+prop.price+"/n-----------------------")
            }
        })
    }

    Buy_property(){
        json_obj={"type":2}

        input = undefined
        input =readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        input.question("Enter PHK of property that you want to buy: ",data=>{
            json_obj["phk"]=data
        })
        input.question("Enter the price: ", data=>{
            json_obj["quoted_price"]=data
        })
        json_obj["pub_key"]=public_key

        conn.write(json_obj)            //object sent=> {"type":2, "pub_key":string, "phk":string, "quoted_price":integer}
        console.log("Request placed.")
    }

}

let user = new Client()
console.log("/n/nUser Details/n")

var json_obj= {"type":4}
user.Initialise(json_obj)

input = undefined
input =readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

input.question("Press 1 to register new property OR 2 to browse property to buy",inpt=>{
    if(inpt==1){//*for myself* convert string to integer
        user.RegisterProp()
    }
    else{
        user.Query_property()
        inpu = undefined
        inpu =readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        while(true){
            inpu.question("1: I would like to query again/n2: I would like to buy a property/n3: Exit",data=>{
                if(data==1){//*for myself* convert string to integer
                    user.Query_property()
                }else if(data==2){
                    user.Buy_property()
                }else{
                    break
                }
            })
        }
        
    }
})
console.log("Start program again to see changes made.")