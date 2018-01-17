
const db = require('../util/cloudant-db');

class StockService {

    getStocks() {
        return db.search();
    }

}

module.exports = new StockService();