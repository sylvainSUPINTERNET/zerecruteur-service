import * as dotenv from 'dotenv'
dotenv.config();
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { logger } from './configuration/logger';
import { productController } from './controllers/product.controller';
import { webhookController } from './controllers/webhook.controller';


const PORT:number = 9000;
const app = express();

const webhookEndpoint = "/webhook";

app.use(cors({
    origin: 'http://localhost:3000', // TODO : Change this to the actual domain
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.json({
    // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
    verify: function(req:any,res:any,buf) {
        console.log("verify");
        const url = req.originalUrl;
        if (url.startsWith(webhookEndpoint)) {
            req.rawBody = buf.toString()
        }
    }}));
app.use(bodyParser.urlencoded({ extended: false }));


// app.use('/api', metricsController);
app.use('/api', productController )
app.use(webhookEndpoint, webhookController)
 
 
app.listen(PORT, () => {
    logger.info(`API is running on : ${PORT}`);
});