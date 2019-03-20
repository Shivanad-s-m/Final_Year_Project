const crypto = require('crypto')
var crypto_NEW = require('crypto-js')
const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
const readline = require('readline');

class UserNode
{
  constructor()
  {
    //List of this.peers: {peer id, connection}
    this.peers = {}
    this.connSeq = 0
    this.myId = crypto.randomBytes(32)
    console.log('Your identity: ' + this.myId.toString('hex'))  
    this.config = defaults({id: this.myId,})
    this.sw = Swarm(this.config)
    this.ConnectionAwait()
  }
  
  BroadcastQuery(tx) {
    for (let id in this.peers) {
      this.peers[id].conn.write('u'+tx)
    }
  }

  
async ConnectionAwait() {
  this.port = await getPort()
  this.sw.listen(this.port)
  // console.log('Listening to port: ' + port)
  this.sw.join('miner_channel')
  this.sw.on('connection', (conn, info) => {
    const seq = this.connSeq
    const peerId = info.id.toString('hex')
    // conn.on('data', data => {
    //   console.log('Received Message ' +data.toString())
    // })
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


}

// Sample Usage:
let usn = new UserNode()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  // console.log(`Received: ${input}`);
  usn.BroadcastQuery(input);
});
