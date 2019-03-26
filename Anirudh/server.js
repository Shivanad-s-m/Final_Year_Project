/*parse_transactions()
1.property_register
2.property_transfer
3.money_Transfer

return */
var money = {}

function phk_generator()//internal property identifier
{
    var crypto = require("crypto");
    var id = crypto.randomBytes(20).toString('hex');

    return id;

}



function handle_transaction(msg)
{
    trans_obj = JSON.parse(msg)

    if(trans_obj['type']==1)//property registration
    {   
        //verify from's signature
        console.log("property registration",trans_obj['pub_key'])    
        phk = phk_generator()
        console.log(phk);
        survey_no = trans_obj.data['survey_no'];
        hissa_no = trans_obj.data['hissa_no'];
        taluk = trans_obj.data['taluk'];
        hobli = trans_obj.data['hobli']

        //add_block(phk,survey_no,hissano,dist,taluk,hobli);
       


    }
    else if(trans_obj['type']==2)//money transaction- i/p - phk,pubkey
    {
        //lock transaction, make buyer get the property
        //verify from's signature
        
        if(!money[phk])
        {
            
        
            money[phk]=trans_obj['pub_key'];
            return 1;
        }
        else{
            console.log("somebody is already purchasing the property")
            return 0;
        }

    }
    else if(trans_obj['type']==3)//property transaction
    {
        //verify  
        //get sellers public key by querying 
        //get phk,accepted price
        //return boolean (unsold or sold)
        if(money[phk]==trans_obj['pub_key'])//
        {
            peers[id].conn.write('u'+trans_obj['pub_key'],trans_obj['phk'],survey_no,hissa_no,dist,taluk)//if needed sssnew_price)
            //append to blockchain with buyer's pubkey and new price
            delete money[phk]
            return 1;
        
        }
        else{
            return 0;
        }
    }
    else if(trans_obj['type']==4)//self query
    {
        //public key
        //returns wallet_money,properties_owned[],buyer{phk,quoted_price}(notifications)
        //assuming miners table structure is
        /*
            miners_table_about_user = {"pub_key":9999,"data":{"money":100,"properties_owned":['a','b','c'],"notifications":{"buyer1_pubkey":1100,"phk":777}}}
        
        
        */ 
        return JSON.stringify(miners_table['pub_key'].get(trans_obj['pub_key']));

    }
    else if(trans_obj['type']==5)//property query
    {
        /*miners table about property
        {
          "pub_key_owner":111,"phk":222,"survey_no":11,"hobli":"sss","price":111}  
        }
        
        */
        //get district or taluk or hobli or village or surveyno
        //return list of properties
        return JSON.stringify(miners_table_property['survey_no'])
    }

}


msg = JSON.stringify({"type":1,"pub_key":111111111})

msg1 = JSON.stringify({"type":1,"pub_key":"111111111","data":{"hissa_no":"1","survey_no":"1","taluk":"mandya","hobli":"abc"}})
msg2 = JSON.stringify({"type":2,"buyers":111111111,"phk":9900,"data":{"hissa_no":1,"survey_no":1,"taluk":"mandya"}})
msg3 = JSON.stringify({"id":3,"pub_key1":111111111,"phk":9900,"pub_key2":2222222,"money":100000})
handle_transaction(msg1);
