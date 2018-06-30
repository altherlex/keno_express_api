var config = [
    { 
      name: "bitcoin",
      url: "https://api.quadrigacx.com/v2/ticker?book=btc_cad"
    },
    { 
      name: "ethereum",
      url: "https://api.quadrigacx.com/v2/ticker?book=eth_cad"
    }
  ]
  , Request = require("request")
  , _ = require('underscore')
  , moment = require('moment')
  , async = require("async");

module.exports.request = function(type, callback) {
  var result = config;

  // if (type)
  //   if (type === 'bitcoin')
  //     delete result.ethereum;
  //   else
  //     delete result.bitcoin;

  async.map(result, function(item, _callback){
    Request.get(item.url, function(error, response, body){
      if(error) return console.log(error);
      body = JSON.parse(body);

      var display = {
        name: item.name,
        current_timestamp: moment().format(),
        ask: parseFloat(body.ask),
        result: body
      };

      _callback(error, display);

    });
  }, function (err, results) {
    callback(err, results);
  });

}
