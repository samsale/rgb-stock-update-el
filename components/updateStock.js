const Shopify = require('shopify-api-node');
const sendPushMessage = require('./sendPushMessage');

// create shopify store object
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
  autoLimit: { calls: 1, interval: 500, bucketSize: 5 },
  timeout: 60000
});


module.exports = async (arrayOfProducts) => {
  let count = 0
  for(let product of arrayOfProducts){
    let quanity = 100
    if (product.stockDescription === "GOOD") {
      quanity = 30
    } else if (product.stockDescription === "LOW") {
      quanity = 6
    }else if (product.stockDescription === "OUT"){
      quanity = 0
    }
    let response = await shopify.inventoryLevel.set({"inventory_item_id": product['inventory_item_id'],
                                      "location_id": 4045635628,
                                      "available":quanity})

    count++
  }
  sendPushMessage(false)
  console.log(`${count} products updated in store`);
}
