const crypto = require('crypto')
var crypto_NEW = require('crypto-js')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const readline = require('readline')
const {fork}=require('child_process')

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

class Utils
{
    static fromAscii(data){
        let data_new = ""
        for(let i=0; i<data.length; i++)
        {
            data_new+=String.fromCharCode(data[i])
        }
        return data_new
    }
}

class MinerNode
{
    constructor()
    {
        //Declare user transactions queue
        this.msg_queue = []
        //Declare global difficulty
        this.glob_difficulty = 3
        //List of peers: {peer id, connection}
        this.peers = {}
        this.connSeq = 0
        //Randomly generate ID
        this.myId = crypto.randomBytes(32)
        console.log('Your identity: ' + this.myId.toString('hex'))        
        this.config = defaults({id: this.myId,})
        this.sw = Swarm(this.config)
        this.ConnectionAwait()
    }

    async ConnectionAwait(){

        this.port = await getPort()
        this.sw.listen(this.port)
        console.log('Listening to port: ' + this.port)
        this.sw.join('miner_channel')
        this.sw.on('connection', (conn, info) => {
            const seq = this.connSeq
            const peerId = info.id.toString('hex')
            console.log(`Connected #${seq} to peer: ${peerId}`)
            //Check current overall blockchain
            if (typeof this.BlockChain1 != "undefined") { 
                console.log("OVERALL BLOCKCHAIN IS\n"+JSON.stringify(this.BlockChain1.blockchain))
                //Broadcast blockchain to new peer for the first time
                console.log("Broadcasting blockchain to new peer")
                conn.write('i'+JSON.stringify(this.BlockChain1))
                console.log("Finished Broadcasting blockchain to new peer")   
            }
            if (info.initiator) {
                try {
                    conn.setKeepAlive(true, 600)
                } catch (exception) {
                    console.log('exception', exception)
                }
            }
            conn.on('data', data => {
                //Received a message from other peer
                console.log('Received Message from peer ' + peerId,'----> ' + data.toString())
                //Convert from string of ASCII values to string of characters
                data = Utils.fromAscii(data)
                if(data[0]==='u')
                {
                    //Message from user, create block for transaction
                    console.log('Received transaction from user ' + peerId,'----> ' + data.slice(1).toString())
                    if(this.msg_queue.length==0){
                        //First message in queue
                        this.msg_queue.push(data.slice(1).toString())
                        console.log("First message in queue, mine directly; queue => "+JSON.stringify(this.msg_queue))                  
                        this.Child = fork('miner_child.js');
                        console.log("Forked child for mining")
                        this.BlockChain1 = this.MineNow(this.BlockChain1)
                    }
                    else if(this.msg_queue.length>0){
                        //Later messages in queue
                        this.msg_queue.push(data.slice(1).toString())
                        console.log("Added message to queue => "+JSON.stringify(this.msg_queue))
                    }
                }
                else if(data[0]==='m')
                {
                    //Message from miner
                    console.log('Received block from miner ' + peerId)
                    if (typeof this.Child != "undefined") {   
                        this.Child.kill('SIGINT')
                        this.msg_queue.shift(this.msg_queue[0])
                        console.log("Mining stopped due to receiving block from other miner")
                        console.log("Child killed, shifted queue => "+JSON.stringify(this.msg_queue))
                    }                    
                    //Extract the block from message
                    let new_block = JSON.parse(data.slice(1))
                    if ( typeof this.BlockChain_temp != "undefined") {      
                        //Blockchain already exists, use existing
                        console.log("Blockchain already exists")
                        this.BlockChain_temp.addBlock(new_block)
                        // console.log("Appended to blockchain"+JSON.stringify(this.BlockChain_temp.blockchain))
                        
                    }
                    else{
                        //Blockchain doesn't already exist, create now
                        console.log("Blockchain doesn't exist")
                        this.BlockChain_temp = new BlockChain(new_block, this.glob_difficulty)
                        // console.log("Created blockchain"+JSON.stringify(this.BlockChain_temp.blockchain))
                    }
                }
                else if(data[0]==='i')
                {
                    console.log("Initializing message received")    
                    if ( typeof this.BlockChain1 == "undefined") { 
                        console.log("New peer, empty blockchain. Copying incoming blockchain")
                        let Blockchain_global = JSON.parse(data.slice(1))
                        this.MergeBlockChain(Blockchain_global)
                        console.log("Finished initializing") 
                        console.log("OVERALL BLOCKCHAIN IS\n"+JSON.stringify(this.BlockChain1.blockchain))   
                    }
                }

            })  
            conn.on('close', () => {
                // Here we handle peer disconnection
                console.log(`Connection ${seq} closed, peer id: ${peerId}`)
                // If the closing connection is the last connection with the peer, removes the peer
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


    async MineNow(BlockChainx){
        this.Child = fork('miner_child.js');
        console.log("Forked child for mining")
        if (typeof BlockChainx != "undefined") {    
            //Blockchain already exists, use existing
            console.log("Blockchain already exists")
            
            this.Child.send(JSON.stringify([this.msg_queue[0], BlockChainx.blockchain[BlockChainx.num_blocks-1].hash, this.glob_difficulty]))
            console.log("Sent params to child for mining")
    
            this.Child.on('message', (block_JSON) => {
                let block = JSON.parse(block_JSON)
                console.log("Received mined block from child")
                BlockChainx.addBlock(block)
                console.log("Appended to blockchain"+JSON.stringify(BlockChainx.blockchain))
                    
                //Broadcast mined block to other miners
                console.log("Broadcasting block")
                for (let id in this.peers) {
                    this.peers[id].conn.write('m'+
                        JSON.stringify(
                        BlockChainx.blockchain[BlockChainx.num_blocks-1]
                        )
                    )
                }
                console.log("Finished Broadcasting block")   
            })
      
            this.Child.on('exit', () => {
                this.msg_queue.shift(this.msg_queue[0])
                console.log("this.Child exited, shifted queue => "+JSON.stringify(this.msg_queue))
                if(this.msg_queue.length>0){
                    this.MineNow(BlockChainx)
                }
                else{
                    console.log("Finished processing queue, returning Blockchain =>"+JSON.stringify(BlockChainx.blockchain))
                    this.MergeBlockChain(BlockChainx)
                }
            })
        }
            
        else {                      
            //Blockchain doesn't already exist, create now
            console.log("Blockchain doesn't exist")
            
            this.Child.send(JSON.stringify([this.msg_queue[0], "0", this.glob_difficulty]))
            console.log("Sent params to child for mining")
    
            this.Child.on('message', (block_JSON) => {
                let block = JSON.parse(block_JSON)
                console.log("Received mined block from child")
                BlockChainx = new BlockChain(block, this.glob_difficulty)
                console.log("Created blockchain"+JSON.stringify(BlockChainx.blockchain))
                    
                //Broadcast mined block to other miners
                console.log("Broadcasting block")
                for (let id in this.peers) {
                    this.peers[id].conn.write('m'+
                        JSON.stringify(
                        BlockChainx.blockchain[BlockChainx.num_blocks-1]
                        )
                    )
                }
                console.log("Finished Broadcasting block")   
            })
    
      
            this.Child.on('exit', () => {
                this.msg_queue.shift(this.msg_queue[0])
                console.log("this.Child exited, shifted queue => "+JSON.stringify(this.msg_queue))
                if(this.msg_queue.length>0){
                    this.MineNow(BlockChainx)
                }
                else{
                    console.log("Finished processing queue, returning Blockchain =>"+JSON.stringify(BlockChainx.blockchain))
                    this.MergeBlockChain(BlockChainx)
                }
            })
    
        }
        return BlockChainx
    }
    

    MergeBlockChain(BlockChainx){
        console.log("Called Merge Block chain function")
        // console.log(this.BlockChain1) 
        // console.log(typeof this.BlockChain1)
        // console.log(this.BlockChain1.isResolved)
        if ( typeof this.BlockChain1 == "undefined" || typeof this.BlockChain1.isResolved == "undefined") {
            this.BlockChain1 = new BlockChain(BlockChainx.blockchain[0], this.glob_difficulty);
        }   
        else {
            this.BlockChain1.addBlock(BlockChainx.blockchain[0]);
        }
        console.log(this.BlockChain1) 
        
        for(let i=1; i<BlockChainx.num_blocks; i++)
        {
            this.BlockChain1.addBlock(BlockChainx.blockchain[i]);

        }
        console.log("OVERALL BLOCKCHAIN IS\n"+JSON.stringify(this.BlockChain1.blockchain))
        //return this.BlockChain1
    }
}



let mn = new MinerNode()
