import Stripe from "stripe";
import { addProduct, productByPaymentLinkIdentifier } from "../services/product.service";
import { Request, Response, NextFunction, Router } from "express";

export const productController = Router();


productController.post('/products/identifier', async ( req:Request, res:Response, _next:NextFunction ) => {

    const result= await productByPaymentLinkIdentifier({
        req,
        res
    });

    if ( result === null ) {
        return res.status(400).json({
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
});

productController.post('/products', async ( req:Request, res:Response, _next:NextFunction ) => {

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
})
