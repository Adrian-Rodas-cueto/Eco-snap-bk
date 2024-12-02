class GenericController {
  // upload file ....................
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded.",
        });
      }

      const { filename, mimetype } = req.file;

      // Validate the file type
      if (!mimetype.startsWith("image/") && mimetype !== "text/csv") {
        return res.status(400).json({
          success: false,
          message: "Unsupported file type.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "File uploaded successfully.",
        filename, // Return only the filename in the response
      });
    } catch (error) {
      console.error("Error in uploadFile:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error.",
      });
    }
  }
}

module.exports = new GenericController();
