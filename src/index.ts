import * as dotenv from 'dotenv'
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import { logger } from './configuration/logger';
import { productController } from './controllers/product.controller';
import { webhookController } from './controllers/webhook.controller';
import { paymentLinkController } from './controllers/paymentLink.controller';
import { orderController } from './controllers/orders.controller';
import path from 'path';
import jwt from 'jsonwebtoken';

const PORT:number = 9000;
const app = express();

const webhookEndpoint = "/webhook";

app.use(cors({
    origin: ['http://localhost:3000', 'https://selflink.fr'],
    credentials: true
}));

// can't use body parser due to stripe webhook using raw body ! ( tested with verify method, is not working !)

app.use(cookieParser());

app.get('/health' , ( req, res ) => {
   res.status(200).send("HEALTHY"); 
});


const middlewareDetectBaconPixelOpen = (req:Request, res:Response, next:NextFunction) => {
    if ( req.query.email ) {
        const tokenEmail:string = req.query.email as string;

        try {
            console.log("decoding token for email ...")
            const email = jwt.verify(tokenEmail, process.env.BACON_PIXEl_TOKEN_SECRET as string);
            console.log("email decoded (email open): ", email);
        } catch ( e ) {
            console.log("Fail to open token for email : ", e);
        }
    } else {
        console.log("Email token not provided while calling /static")
    }

    next();
};

app.use('/static', middlewareDetectBaconPixelOpen,express.static(path.join(__dirname, 'public')))

app.use((req,res,next) => {
    logger.info(`Request ${req.method} ${req.url}`);
    next();
})

app.use('/api', express.json(), productController )
app.use('/api', express.json(), paymentLinkController )
app.use('/api', express.json(), orderController )
app.use(webhookEndpoint, express.raw({type: 'application/json'}), webhookController)
 
 
app.listen(PORT, () => {
    logger.info(`API is running on : ${PORT}`);
});