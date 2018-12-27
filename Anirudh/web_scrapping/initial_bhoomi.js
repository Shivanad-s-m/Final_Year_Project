var request = require('request');
var cheerio = require('cheerio');

var fs = require('fs');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0 //need to improve this method as request is insecure
request("https://landrecords.karnataka.gov.in/rtconline/", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("Status code: " + response.statusCode);
  console.log(body)
  var $ = cheerio.load(body);

  

});
