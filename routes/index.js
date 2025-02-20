const express = require("express");
const Router = express.Router();

const userRouter = require("./user");
const storeRouter = require("./stores");
const productRouter = require("./products");
const inventoryRouter = require("./inventory");
const categoryRouter = require("./Category");
const compaignRouter = require("./compaign");
const genericRouter = require("./generic");
const supplierRouter = require("./supplier");
const statisticsRouter = require("./statistics");
const chatRouter = require("./chat");

Router.use("/user", userRouter);
Router.use("/stores", storeRouter);
Router.use("/products", productRouter);
Router.use("/inventory", inventoryRouter);
Router.use("/category", categoryRouter);
Router.use("/compaign", compaignRouter);
Router.use("/generic", genericRouter);
Router.use("/supplier", supplierRouter);
Router.use("/statistics", statisticsRouter);
Router.use("/chat", chatRouter);

module.exports = Router;
