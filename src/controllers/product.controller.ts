import Stripe from "stripe";
import { addProduct, productByPaymentLinkIdentifier } from "../services/product.service";
import { Request, Response, NextFunction, Router } from "express";
import { logger } from "../configuration/logger";

export const productController = Router();


productController.post('/products/identifier', async ( req:Request, res:Response, _next:NextFunction ) => {

    try {
        const result= await productByPaymentLinkIdentifier({
            req,
            res
        });
    
        if ( result === null ) {
            return res.status(204).json({
                "response": {
                    "message": "Product not found",
                    "data": null
                }
            });
        }
    
        return res.status(200).json({
            "response": {
                "message": "Product found",
                "data": result
            }
        });
    } catch ( e ) {
        logger.error(e);

        return res.status(500).json({
            "response": {
                "message": "Internal server error",
                "data": null
            }
        });

    }
    
});

productController.post('/products', async ( req:Request, res:Response, _next:NextFunction ) => {

    try {
        const result:Stripe.Response<Stripe.Product> = await addProduct({
            req,
            res
        });
    
        return res.status(200).json({
            "response": {
                "message": "Product added successfully",
                "data": result.id
            }
        });
    } catch ( e ) {
        logger.error(e);

        return res.status(500).json({
            "response": {
                "message": "Internal server error",
                "data": null
            }
        });
    }

})
