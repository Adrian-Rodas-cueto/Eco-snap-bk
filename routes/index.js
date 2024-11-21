const express = require("express");
const Router = express.Router();

const userRouter = require("./user");
const storeRouter = require("./stores");
const productRouter = require("./products");
const inventoryRouter = require("./inventory");

Router.use("/user", userRouter);
Router.use("/stores", storeRouter);
Router.use("/products", productRouter);
Router.use("/inventory", inventoryRouter);

module.exports = Router;
