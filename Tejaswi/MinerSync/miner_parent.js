const crypto = require('crypto')
var crypto_NEW = require('crypto-js')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const readline = require('readline')
const {fork}=require('child_process')

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

class BlockChain {

    constructor(genesis_block, difficulty){
        this.blockchain = [genesis_block] 
        this.difficulty = difficulty
        this.num_blocks=1
    }

    addBlock(new_block){
        this.blockchain.push(new_block)
        this.num_blocks++
    }

    isChainValid()
    {
		for(let i=1; i<this.num_blocks; i++)
		{
			let prevB = this.blockchain[i-1]
			let currB = this.blockchain[i]
			if(currB.hash.localeCompare(currB.calculateHash())!=0)
			{
				console.log("Current hash changed")
				return false
			}
			if(prevB.hash.localeCompare(currB.previousHash)!=0)
			{
				console.log("Previous hash changed")
				return false
			}
		}
		return true
	}

}

function fromAscii(data){
    let data_new = ""
    for(let i=0; i<data.length; i++)
    {
        data_new+=String.fromCharCode(data[i])
    }
    return data_new
}

//Declare blockchain
var BlockChain1

//Declare child
var Child

//Declare global difficulty
const glob_difficulty = 5

//List of peers: {peer id, connection}
const peers = {}
let connSeq = 0

//Randomly generate ID
const myId = crypto.randomBytes(32)
console.log('Your identity: ' + myId.toString('hex'))

let rl
function log () {
  if (rl) {
    rl.clearLine()    
    rl.close()
    rl = undefined
  }
  for (let i = 0, len = arguments.length; i < len; i++) {
    console.log(arguments[i])
  }
}

const config = defaults({
  id: myId,
})

const sw = Swarm(config)

;(async () => {

  const port = await getPort()

  sw.listen(port)
  console.log('Listening to port: ' + port)

  sw.join('miner_channel')
  sw.on('connection', (conn, info) => {
    
    const seq = connSeq

    const peerId = info.id.toString('hex')
    log(`Connected #${seq} to peer: ${peerId}`)
	    
    if (info.initiator) {
      try {
        conn.setKeepAlive(true, 600)
      } catch (exception) {
        log('exception', exception)
      }
    }
	  
    conn.on('data', data => {
        //Received a message from other peer
        console.log('Received Message from peer ' + peerId,'----> ' + data.toString())

        //Convert from string of ASCII values to string of characters
        data = fromAscii(data)

        if(data[0]==='u')
        {
            //Message from user, create block for transaction
            log('Received transaction from user ' + peerId,'----> ' + data.slice(1).toString())

            Child = fork('miner_child.js');
            console.log("Forked child for mining")
            
            if (typeof BlockChain1 != "undefined") {    
                //Blockchain already exists, use existing
                console.log("Blockchain already exists")
                
                Child.send(JSON.stringify([data.slice(1), BlockChain1.blockchain[BlockChain1.num_blocks-1].hash, glob_difficulty]))
                console.log("Sent params to child for mining")

                Child.on('message', (block_JSON) => {
                    let block = JSON.parse(block_JSON)
                    console.log("Received mined block from child")
                    BlockChain1.addBlock(block, conn)
                    console.log("Appended to blockchain"+JSON.stringify(BlockChain1.blockchain))
                        
                    //Broadcast mined block to other miners
                    console.log("Broadcasting block")
                    for (let id in peers) {
                        peers[id].conn.write('m'+
                            JSON.stringify(
                            BlockChain1.blockchain[BlockChain1.num_blocks-1]
                            )
                        )
                    }
                    console.log("Finished Broadcasting block")   
                })
            }
            
            else {                      
                //Blockchain doesn't already exist, create now
                console.log("Blockchain doesn't exist")
                
                Child.send(JSON.stringify([data.slice(1), "0", glob_difficulty]))
                console.log("Sent params to child for mining")

                Child.on('message', (block_JSON) => {
                    let block = JSON.parse(block_JSON)
                    console.log("Received mined block from child")
                    BlockChain1 = new BlockChain(block, glob_difficulty)
                    console.log("Created blockchain"+JSON.stringify(BlockChain1.blockchain))
                        
                    //Broadcast mined block to other miners
                    console.log("Broadcasting block")
                    for (let id in peers) {
                        peers[id].conn.write('m'+
                            JSON.stringify(
                            BlockChain1.blockchain[BlockChain1.num_blocks-1]
                            )
                        )
                    }
                    console.log("Finished Broadcasting block")   
                })
            }
        }
        else if(data[0]==='m')
        {
            //Message from miner
            log('Received block from miner ' + peerId)

            if (typeof Child != "undefined") {   
                Child.kill('SIGINT')
                console.log("Mining stopped due to receiving block from other miner")
            }                 
		
            //Extract the block from message
            let new_block = JSON.parse(data.slice(1))
            if (typeof BlockChain1 != "undefined") {      
                //Blockchain already exists, use existing
                console.log("Blockchain already exists")
                BlockChain1.addBlock(new_block)
                console.log("Appended to blockchain"+JSON.stringify(BlockChain1.blockchain))
            }
            else{
                //Blockchain doesn't already exist, create now
                console.log("Blockchain doesn't exist")
                BlockChain1 = new BlockChain(new_block, glob_difficulty)
                console.log("Created blockchain"+JSON.stringify(BlockChain1.blockchain))
            }
        }
    })

    conn.on('close', () => {
      // Here we handle peer disconnection
      log(`Connection ${seq} closed, peer id: ${peerId}`)
      // If the closing connection is the last connection with the peer, removes the peer
      if (peers[peerId].seq === seq) {
        delete peers[peerId]
      }
    })

    if (!peers[peerId]) {
      peers[peerId] = {}
    }
    peers[peerId].conn = conn
    peers[peerId].seq = seq
    connSeq++
  })
  //askUser()
})()
