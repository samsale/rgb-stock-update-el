const dotenv = require('dotenv').config()
const downloadShopifyProducts = require('./components/downloadShopifyProducts');
const gmailToJson = require('./components/gmailApiToJson.js');
const checkWhatIsInStore = require('./components/sortProducts');
const updateStock = require('./components/updateStock');
const sendPushMessage = require('./components/sendPushMessage');
const updateStockMetadata = require('./components/updateStockMetadata')

module.exports.index = async () => {
  try{
    let [stockUpdateArray, stringForPushMessage] = await gmailToJson()
    let productsArray = await downloadShopifyProducts()
    let shopifyUpdateArray = await checkWhatIsInStore(stockUpdateArray, productsArray)
    await updateStockMetadata(shopifyUpdateArray)
    let numberOfProductsUpdated = await updateStock(shopifyUpdateArray)
    await sendPushMessage(`${numberOfProductsUpdated} products updated - ${stringForPushMessage}`, -2)
  }
  catch(err){
     await sendPushMessage(`Error (${err.source})`, 1)
     console.log(err);
  }
}
