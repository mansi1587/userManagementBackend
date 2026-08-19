const pool = require("../config/db");

const {
  processDocument,
} = require("../services/documentProcessingService");

const uploadDocument = async (req, res) => {
  let document = null;
  try {
    console.log("Authenticated user:", req.user);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "PDF file is required",
        errors: [],
      });
    }

    const {
      originalname,
      path: filePath,
      mimetype,
      size,
    } = req.file;

    const uploadedBy = req.user.userId;

    // -----------------------------------------
    // Step 1: Save document information
    // -----------------------------------------

    const result = await pool.query(
      `
      INSERT INTO documents
      (
        file_name,
        file_path,
        mime_type,
        file_size,
        uploaded_by,
        processing_status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        originalname,
        filePath,
        mimetype,
        size,
        uploadedBy,
        "PROCESSING",
      ]
    );

    document = result.rows[0];

    console.log("Document saved:", document.id);

    // -----------------------------------------
    // Step 2: Process PDF
    // -----------------------------------------

    const processingResult = await processDocument(
      filePath,
      document.id
    );


// -----------------------------------------
// Step 3: Mark processing as completed
// -----------------------------------------

await pool.query(
  `
  UPDATE documents
  SET processing_status = 'COMPLETED'
  WHERE id = $1
  `,
  [document.id]
);

    // -----------------------------------------
    // Step 4: Send response
    // -----------------------------------------

    return res.status(201).json({
      success: true,
      data: {
        document,
        processing: processingResult,
      },
      message: "PDF uploaded and processed successfully",
      errors: [],
    });

  } catch (error) {
  console.error("Upload document error:", error);

  if (error.code === "DOCUMENT_PROCESSING_FAILED") {

    // Mark document processing as failed
    if (document?.id) {
      try {
        await pool.query(
          `
          UPDATE documents
          SET processing_status = 'FAILED'
          WHERE id = $1
          `,
          [document.id]
        );
      } catch (updateError) {
        console.error(
          "Failed to update processing status:",
          updateError
        );
      }
    }

    return res.status(503).json({
      success: false,
      data: null,
      message: "Document processing service is currently unavailable.",
      errors: [
        {
          code: error.code,
          message: "The PDF could not be processed at this time.",
        },
      ],
    });
  }

  return res.status(500).json({
    success: false,
    data: null,
    message: "Failed to upload and process PDF",
    errors: [],
  });
}
};

const getDocuments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        file_name,
        processing_status,
        created_at
      FROM documents
      WHERE processing_status = 'COMPLETED'
      ORDER BY created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      message: "Documents fetched successfully",
      errors: [],
    });

  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch documents",
      errors: [],
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
};





// const pool = require("../config/db");

// const uploadDocument = async (req, res) => {
//   try {
//     console.log("Authenticated user:", req.user);

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         data: null,
//         message: "PDF file is required",
//         errors: [],
//       });
//     }

//     const {
//       originalname,
//       filename,
//       path: filePath,
//       mimetype,
//       size,
//     } = req.file;

//     const uploadedBy = req.user.userId;

//     const result = await pool.query(
//       `
//       INSERT INTO documents
//       (
//         file_name,
//         file_path,
//         mime_type,
//         file_size,
//         uploaded_by
//       )
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING *
//       `,
//       [
//         originalname,
//         filePath,
//         mimetype,
//         size,
//         uploadedBy,
//       ]
//     );

//     res.status(201).json({
//       success: true,
//       data: result.rows[0],
//       message: "PDF uploaded successfully",
//       errors: [],
//     });

//   } catch (error) {
//     console.error("Upload document error:", error);

//     res.status(500).json({
//       success: false,
//       data: null,
//       message: "Failed to upload PDF",
//       errors: [],
//     });
//   }
// };

// module.exports = {
//   uploadDocument,
// };