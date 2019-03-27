var crypto_NEW = require('crypto-js')
class Block {
    constructor(data, previousHash){
		this.data = data
		this.previousHash = previousHash
		this.timeStamp = new Date().getTime()
		this.nonce = 0
		this.hash = this.calculateHash()
    }

    calculateHash(){
        return crypto_NEW.SHA256(
        this.previousHash + 
        this.timeStamp.toString() + 
        this.nonce.toString()
        ).toString()
    }

    mineBlock(difficulty){
        let target = Array(difficulty+1).join('0')
        while(this.hash.substring(0, difficulty).localeCompare(target)!=0)
        {
            //System.out.println("Current hash: "+hash.toString());
            this.nonce++;
            this.hash = this.calculateHash()
            //CHECK FOR INCOMING MESSAGE??
        }
		//console.log("Block mined: " + this.hash)
    }
}

//Declare new block
var newBlock

//Receive transaction from parent
process.on('message', (params_JSON) => {
    params = JSON.parse(params_JSON)
    tx = params[0]
    prevHash = params[1]
    difficulty = params[2]
    console.log('Miner child received transaction:', tx)
    newBlock = new Block(tx, prevHash)
    //Do mining
    newBlock.mineBlock(difficulty)
    //Return mined block to parent
    process.send(JSON.stringify(newBlock));
    //Exit
    process.exit()
});
