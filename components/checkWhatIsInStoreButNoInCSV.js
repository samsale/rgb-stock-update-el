function compareSkus(array, newSku) {
  return array.find(object => object.sku === newSku);
}

function checkIfFinished(array, skuInStore){
  return array.find(object => object.sku === skuInStore);
}

module.exports =  (stockUpdateArray, inStoreArray) =>{
  let finishedArray = stockUpdateArray.filter(object => object.nextDeliveryDate ==='FINISHED')
  let notInCsvArray = []
  for(let value of inStoreArray){
    //check if sku is missing from csv
    if(!compareSkus(stockUpdateArray, value.sku)){
      notInCsvArray.push(value)
      //if it is the spreadsheet but is m
    }else if (checkIfFinished(finishedArray, value.sku )) {

      notInCsvArray.push(value)
    }
  }
  return notInCsvArray
}
