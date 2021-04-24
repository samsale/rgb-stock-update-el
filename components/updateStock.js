const Shopify = require('shopify-api-node');

// create shopify store object
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
  autoLimit: { calls: 1, interval: 500, bucketSize: 5 },
  timeout: 60000
});

const validateDate = (nextDeliveryDateStatus) => {
  const elDateRegex = /^(([0-9])|([0-2][0-9])|([3][0-1]))\-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\-\d{2}$/gmi

  if (!nextDeliveryDateStatus) return false
  if (nextDeliveryDateStatus === "FINISHED") return false
  if (elDateRegex.test(nextDeliveryDateStatus)) return true
}


module.exports = async (arrayOfProducts) => {
  const tablesToIgnore = []
  let count = 0
  for(let product of arrayOfProducts){
    let quanity = 100
    if(tablesToIgnore.includes(product.sku)){
      quanity = 2
    } else if (product.stockDescription === "GOOD") {
      quanity = Math.floor(Math.random() * (13 - 8 + 1) + 8)
    } else if (product.stockDescription === "LOW") {
      quanity = (product.quantity) ? parseInt(product.quantity) : 7;
    } else if (product.stockDescription === "OUT"){
      quanity = 0
    }
    let response = await shopify.inventoryLevel.set({"inventory_item_id": product['inventory_item_id'],
                                      "location_id": 4045635628,
                                      "available":quanity})
    if(validateDate(product.nextDeliveryDate) && product.stockDescription === "OUT"){
      await shopify.productVariant.update(product['variant_id'], {"inventory_policy": "continue"})
    }else{
      await shopify.productVariant.update(product['variant_id'], {"inventory_policy": "deny"})
    }
    count++
  }

  console.log(`${count} products updated in store`)
   return count;
}
