const Shopify = require('shopify-api-node');

// create shopify store object
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
  autoLimit: { calls: 1, interval: 500, bucketSize: 5 },
  timeout: 60000
});

const monthsMap = {
  'Jan' : 'January',
  'Feb' : 'February',
  'Mar' : 'March',
  'Apr' : 'April',
  'May' : 'May',
  'Jun' : 'June',
  'Jul' : 'July',
  'Aug' : 'August',
  'Sep' : 'September',
  'Oct' : 'October',
  'Nov' : 'November',
  'Dec' : 'December'
}

const validateDate = (nextDeliveryDateStatus) => {
  const elDateRegex = /^(([0-9])|([0-2][0-9])|([3][0-1]))\-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\-\d{2}$/gmi

  if (!nextDeliveryDateStatus) return false
  if (nextDeliveryDateStatus === "FINISHED") return false
  if (elDateRegex.test(nextDeliveryDateStatus)) return true
}

const checkValidMetaObject = (element) => element.namespace === 'stock' && element.key === 'status';

const createJsonStringForMetafield = (updateObject) => {

  let metafieldObject = {can_pre_order: false, finished: false, date_when_back_in_stock: null}
  //If the product is finished aka it won't be coming back in to stock
  if (updateObject.nextDeliveryDate === 'FINISHED') {
      metafieldObject.finished = true
      
      return JSON.stringify(metafieldObject)
  }

  //If the product has a back in stock date then we know we can list it for pre-order
  if (validateDate(updateObject.nextDeliveryDate)) {
    metafieldObject.can_pre_order = true 
    const dateStringAsAnArray = updateObject.nextDeliveryDate.split("-")
    metafieldObject.date_when_back_in_stock = dateStringAsAnArray

    const covertedMonth = monthsMap[metafieldObject.date_when_back_in_stock[1]]
    const dateWith20Added = `20${metafieldObject.date_when_back_in_stock[2]}`
    
    metafieldObject.date_when_back_in_stock[1] = covertedMonth
    metafieldObject.date_when_back_in_stock[2] = dateWith20Added

    return JSON.stringify(metafieldObject)
  }

  //If the product does not have a back in stock date then we won't make it availble for pre-order
  return JSON.stringify(metafieldObject)

}


module.exports = async (arrayOfProducts) => {
  let count = 0
  //create an array with just the SKUs that have a back in stock value
  const productsThatAreOutOfStock = arrayOfProducts.filter(product => product.stockDescription === "OUT")
  
  for (const product of productsThatAreOutOfStock) {
    const variantMetaFields = await shopify.metafield.list({
      metafield: { owner_resource: 'variant', owner_id: product.variant_id} 
    })

    const metafieldSotckString = createJsonStringForMetafield(product)
  
    //if the variant does not have a stock metafield
    if (variantMetaFields.length < 1) {
      //create metadafield from scratch
      await shopify.metafield.create({
        key: 'status',
        value: metafieldSotckString,
        value_type: 'json_string',
        namespace: 'stock',
        owner_resource: 'variant',
        owner_id: product.variant_id
      })

    }
    //if the variant already has a stock metafield
    if (variantMetaFields && variantMetaFields.some(checkValidMetaObject)) {
    
      const stockMetafield = variantMetaFields.find(metafieldObj => metafieldObj.key === "status")
        //update metafield
      await shopify.metafield.update(stockMetafield.id, {value: metafieldSotckString} )
      
    }
    count++
  }
   console.log(`${count} out of stock items metafields's updated`)
   return count;
}
