var request = require('request');
var cheerio = require('cheerio');

var fs = require('fs');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0 //need to improve this method as request is insecure

url = 'https://landrecords.karnataka.gov.in/rtconline/About.aspx?'
a=26
dist = 'dist_code='+a;
b=4
taluk='taluk_code='+b;
c=2;
hobli='hobli_code='+c;
d=20
village='village_code='+d;
e=28
survey_no1='surveyno='+e;
survey_noc='surnoc=*'
f=29
hissa='hissa=29'

url = url+dist+'&'+taluk+'&'+hobli+'&'+village+'&'+survey_no1+'&'+survey_noc+'&'+hissa;
console.log(url)
console.log(dist)

request(url, function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("Status code: " + response.statusCode);
  console.log(body)
  var $ = cheerio.load(body);
  const siteHeading =$('.site-heading')
  //console.log(siteHeading.html())
  //console.log(siteHeading.text())

});
