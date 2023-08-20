import * as dotenv from 'dotenv'
dotenv.config();
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { logger } from './configuration/logger';
import { productController } from './controllers/product.controller';


const PORT:number = 9000;
const app = express();



app.use(cors({
    origin: 'http://localhost:3000', // TODO : Change this to the actual domain
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// app.use('/api', metricsController);
app.use('/api', productController )

app.listen(PORT, () => {
    logger.info(`API is running on : ${PORT}`);
});