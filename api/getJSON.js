var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getJSON(yourUrl) {

    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText; 

}

//! how to use this!
// getJSONP('http://soundcloud.com/oembed?url=http%3A//soundcloud.com/forss/flickermood&format=js&callback=?', function(data){
//     console.log(data);
// });  

module.exports = getJSON
