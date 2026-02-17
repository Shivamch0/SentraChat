import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async (req, res) => {
  try {
    const connection = await mongoose.connect(
      `${process.env.DB_URL}/${DB_NAME}`,
    );
    console.log(
      "Database Connected Successfully...",
      connection.connection.host,
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export { connectDB };
