const User = require("./users");
const Store = require("./stores");
const Product = require("./products");
const Supplier = require("./supplier");
const Inventory = require("./inventory");
const CustomerBehavior = require("./customerBehavior");
const Campaign = require("./campaign");

// Export all models as an object
module.exports = {
  User,
  Store,
  Product,
  Supplier,
  Inventory,
  CustomerBehavior,
  Campaign,
  // Add other models as needed
};
