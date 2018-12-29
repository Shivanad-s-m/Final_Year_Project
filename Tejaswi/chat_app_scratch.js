var swarm = require('discovery-swarm')
const crypto = require('crypto')
const getPort = require('get-port'); //to generate random ports for each system
var readline = require('readline')

rl = readline.createInterface(process.stdin, process.stdout);
let counter =0;
const peers ={}
var sw = swarm({
id: crypto.randomBytes(32), // peer-id for user
    //extracted as sw.id
        
    // stream: stream, // stream to replicate across peers
    // connect: fn, // connect local and remote streams yourself
    // utp: true, // use utp for discovery
    //tcp: true, // use tcp for discovery
    // maxConnections: 0, // max number of connections.
    //  whitelist: [] // array of ip addresses to restrict connections to
});

//sw.listen(65002)  cant use same port from same system
;(async () => {
    const port = await getPort()
    sw.listen(port)

    sw.join('fun-channel')
    //add all peer-id to array peers
    //on connection of peer event

    sw.on('connection',  function(conn,info) {


        /* info contains
        { type: 'tcp', // the type, tcp or utp.
        initiator: true, // whether we initiated the connection or someone else did.
        channel: Buffer('...'), // the channel this connection was initiated on. only set if initiator === true.
        host: '127.0.0.1', // the remote address of the peer.
        port: 8080, // the remote port of the peer.
        id: Buffer('...') // the remote peer's peer-id.
        }
        */
        // Keep alive TCP connection with peer
        if (info.initiator) {
        try {
            conn.setKeepAlive(true, 600)
        } catch (exception) {
            log('exception', exception)
        }
        }

        
        var peerid=info.id.toString('hex')
        peers[counter]=conn  //dictionary with counter as key and connection soket as value
        
        counter++



        conn.on('data', data =>  {
            // Here we handle incomming messages
            console.log('Received Message from peer ' + '----> ' + data.toString())
        })

    })
})()




rl.on('line', function(line){
  
    for(let v of Object.entries(peers)){
        v[1].write(line.toString() )//v[1] is connection socket ,sending all peers messages
    }
    
    rl.prompt();
})





/*conn.on('data',function(data)
{
  stdin.addListener("data", function(d) {   //an alternative for readline interface
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 
    console.log("you entered: [" + 
        d.toString().trim() + "]");
  });
  

*/
