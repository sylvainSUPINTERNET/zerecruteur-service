import * as dotenv from 'dotenv'
dotenv.config();
import { loadConfiguration } from './configuration/firebaseConfig';
import express from "express";
import { metricsController } from './controllers/metrics.controller';
import cors from "cors"
import cookieParser from "cookie-parser";

const PORT:number = 9000;
const app = express();

app.use(cors());
app.use(cookieParser());
app.use('/api', metricsController);

app.listen(PORT, () => {
    console.log(`API is running on : ${PORT}`);
});