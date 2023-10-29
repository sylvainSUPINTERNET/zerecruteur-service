import * as dotenv from 'dotenv'
dotenv.config();
import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import { logger } from './configuration/logger';
import { productController } from './controllers/product.controller';
import { webhookController } from './controllers/webhook.controller';
import { paymentLinkController } from './controllers/paymentLink.controller';
import { orderController } from './controllers/orders.controller';

const PORT:number = 9000;
const app = express();

const webhookEndpoint = "/webhook";

app.use(cors({
    origin: 'http://localhost:3000', // TODO : Change this to the actual domain
    credentials: true
}));

// can't use body parser due to stripe webhook using raw body ! ( tested with verify method, is not working !)

app.use(cookieParser());

app.get('/health' , ( req, res ) => {
   res.status(200).send("HEALTHY"); 
});


app.use('/api', express.json(), productController )
app.use('/api', express.json(), paymentLinkController )
app.use('/api', express.json(), orderController )
app.use(webhookEndpoint, express.raw({type: 'application/json'}), webhookController)
 
 
app.listen(PORT, () => {
    logger.info(`API is running on : ${PORT}`);
});