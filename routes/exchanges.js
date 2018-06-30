var express = require('express')
  , bodyParser = require('body-parser')
  , _ = require('underscore')
  , db = require('../lib/db')
  , cryptocurrency = require('../lib/cryptocurrency')
  , helper = require('../lib/helper')
  , async = require('async')
  , moment = require('moment');
var router = express.Router();

/**
 * @swagger
 * resourcePath: /exchanges
 * description: All about API
 *
 */

/**
 * @swagger
 * path: /check_prices
 * operations:
 *   -  httpMethod: GET
 *      summary: Check asked price currency
 *      notes: Returns the ask price of Bitcoin or Ethereum
 *      nickname: check_prices
 *      consumes: 
 *        - application/json
 */           
router.get('/check_prices', function(req, res) {
  cryptocurrency.request(null, function(err, results) {
    res.json(results);
  });
});

/**
 * @swagger
 * path: /exchanges
 * operations:
 *   -  httpMethod: GET
 *      summary: List exchanges
 *      notes: Returns a list of exchanges
 *      nickname: exchanges
 *      consumes: 
 *        - application/json
 *      parameters:
 *        - name: user_name
 *          description: user_name
 *          paramType: query
 *          dataType: string
 */           
router.get('/exchanges', function(req, res) {
  db.conn(function(db){
    var filter = null;
    if (req.query.user_name)
      filter = { user_name: req.query.user_name };
    
    db.collection('exchanges').find(filter).toArray(function(err, results) {
      res.json(results);
    });
  });
})

/**
 * @swagger
 * path: /exchanges
 * operations:
 *   -  httpMethod: POST
 *      summary: Create a new User_transaction
 *      notes: Returns the new User_transaction created
 *      responseClass: User_transactions
 *      nickname: exchanges
 *      consumes: 
 *        - application/json
 *      parameters:
 *        - name: user_name
 *          description: user_name
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: currency_type
 *          description: (B)itcoin or (E)thereum
 *          paramType: query
 *          required: true
 *          dataType: string
 *        - name: cad_amount
 *          description: Set cad_amount or coin_amount
 *          paramType: query
 *          dataType: float
 *        - name: coin_amount
 *          description: Set coin_amount or cad_amount
 *          paramType: query
 *          dataType: float
 */
router.post('/exchanges', function(req, res) {
  req.query = _.extend(req.query, {updated_at: moment().toDate(), created_at: moment().toDate()});

  req.query.currency_type = req.query.currency_type.toLowerCase();
  if ((req.query.currency_type!=='b') && (req.query.currency_type!=='e'))
    return res.json({error:'Inform currency_type. Set B or E'})
  if ((!req.query.cad_amount) && (!req.query.coin_amount))
    return res.json({error:'Inform cad_amount or coin_amount'})
  if ((req.query.cad_amount) && (req.query.coin_amount))
    return res.json({error:'Choose cad_amount or coin_amount'})
  if (req.query.cad_amount)
    req.query.coin_amount = null;
  if (req.query.currency_type === 'b')
    req.query.currency_type = 'bitcoin';
  if (req.query.currency_type === 'e')
    req.query.currency_type = 'ethereum';

  async.parallel({
    get_check_prices: function(callback){
      cryptocurrency.request(null, function(err, exchanges) {

        var exchange = _.findWhere(exchanges, { name: req.query.currency_type });
        callback(err, exchange);
      });
    }
  }, function(err, exchange) {
    if (err) return res.json(err);

    req.query.asked_price = exchange.get_check_prices.ask
    req.query.asked_timestamp = exchange.get_check_prices.current_timestamp

    if (req.query.cad_amount)
      req.query.coin_amount = req.query.cad_amount / req.query.asked_price
    else
      req.query.cad_amount = req.query.coin_amount * req.query.asked_price

    
    db.conn(function(db) {
      db.collection('exchanges').save(req.query, function(err, result) {
        if (err) return console.log(err)
        res.json(req.query);
      });
    });
  }); // async parallel end
})


module.exports = router;

/**
 * @swagger
 * models:
 *   User_transactions:
 *     id: User_transactions
 *     properties:
 *       user_name: 
 *         type: String
 *         format: date-time
 *         required: true
 *       currency_type: 
 *         type: float
 *         required: true
 *       cad_amount: 
 *         type: float
 *         required: true
 *       coin_amount: 
 *         type: float
 *         required: true
 *       asked_price: 
 *         type: float
 *         required: true
 *       updated_at: 
 *         type: DateTime
 *         format: date-time
 *         required: true
 *       created_at: 
 *         type: DateTime
 *         format: date-time
 *         required: true
 */