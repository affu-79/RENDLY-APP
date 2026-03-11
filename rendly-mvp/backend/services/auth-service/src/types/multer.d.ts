/** Extend Express Request so req.file exists after multer.single() middleware. */
declare global {
  namespace Express {
    interface Request {
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
      };
    }
  }
}

export {};
