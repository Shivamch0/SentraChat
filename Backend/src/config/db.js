import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import dns from 'dns'

dns.setServers(["1.1.1.1" , "8.8.8.8"])

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
