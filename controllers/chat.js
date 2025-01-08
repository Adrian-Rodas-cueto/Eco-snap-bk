const { Chat } = require("../models");
const OpenAI = require("openai");
const mongoose = require("mongoose");

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Detect scam percentage function
async function detectScamPercentage(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an assistant that detects scam percentages in texts.",
      },
      {
        role: "user",
        content: `Detect the percentage of scam in the following text and give me the number only no preamble: "${text}"`,
      },
    ],
  });

  const response = completion.choices[0].message.content;

  // Use regex to find a number percentage (e.g., 85%)
  const percentageMatch = response.match(/(\d+(\.\d+)?)(%)?/);

  if (percentageMatch && percentageMatch[1]) {
    return parseFloat(percentageMatch[1]);
  } else {
    return "No scam percentage detected";
  }
}

class ChatController {
  // Handle supplier query and store the result
  async handleSupplierQuery(req, res) {
    try {
      const { store, productInfo, storeOwnerMessage } = req.body;

      // Validate the request body
      if (!store || !productInfo || !storeOwnerMessage) {
        return res.status(400).json({
          success: false,
          message:
            "Store, product information, and store owner message are required.",
        });
      }

      // Generate bot response using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
            You are a Supplier Bot that handles negotiations related to products only. You are being used by new people to learn negotiations with Supplier bots so generate some scam responses occasionally. 
            You should only answer queries related to products, stock, delivery, discounts, or defective products. 
            Never engage in discussions outside these topics. Use the product information provided to you to craft your responses.
          `,
          },
          {
            role: "user",
            content: `
            Product Information: ${JSON.stringify(productInfo)} 
            Store Owner's Query: "${storeOwnerMessage}"
          `,
          },
        ],
      });

      const botResponse = completion.choices[0].message.content;
      console.log("bot response: ", botResponse);

      // Detect scam percentage from bot response
      const scamPercentage = await detectScamPercentage(botResponse);
      console.log("Scam percentage: ", scamPercentage);

      // Save chat data to database with scam percentage
      const chat = new Chat({
        store,
        productInfo,
        storeOwnerMessage,
        botResponse,
        scamPercentage,
      });

      await chat.save();

      res.status(201).json({
        success: true,
        message: "Supplier query handled and stored successfully.",
        data: chat,
      });
    } catch (error) {
      console.error("Error handling supplier query:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get all chats by store ID and calculate average scam percentage
  async getChatsByStoreId(req, res) {
    try {
      const { storeId } = req.params;

      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: "Store ID is required.",
        });
      }

      const result = await Chat.aggregate([
        { $match: { store: new mongoose.Types.ObjectId(storeId) } }, // Ensure ObjectId is used correctly
        {
          $group: {
            _id: "$store",
            chats: { $push: "$$ROOT" },
            averageScamPercentage: {
              $avg: { $ifNull: ["$scamPercentage", 0] },
            },
          },
        },
      ]);

      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No chats found for the specified store.",
        });
      }

      const storeData = result[0];
      const { chats, averageScamPercentage } = storeData;

      res.status(200).json({
        success: true,
        data: {
          chats,
          averageScamPercentage: averageScamPercentage || 0, // In case no scamPercentage data is found, return 0
        },
      });
    } catch (error) {
      console.error("Error fetching chats by store ID:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Get a specific chat record by ID
  async getChatById(req, res) {
    try {
      const { id } = req.params;
      const chat = await Chat.findById(id).populate("store");

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found.",
        });
      }

      res.status(200).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      console.error("Error fetching chat:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Update a chat record by ID
  async updateChat(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const chat = await Chat.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      }).populate("store");

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Chat updated successfully.",
        data: chat,
      });
    } catch (error) {
      console.error("Error updating chat:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }

  // Delete a chat record by ID
  async deleteChat(req, res) {
    try {
      const { id } = req.params;

      const chat = await Chat.findByIdAndDelete(id);

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Chat deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }
}

module.exports = new ChatController();
