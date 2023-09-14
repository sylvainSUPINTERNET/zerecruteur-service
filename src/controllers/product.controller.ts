import Stripe from "stripe";
import { loadConfiguration } from "../configuration/firebaseConfig";
import { addProduct } from "../services/product.service";
import { Request, Response, NextFunction, Router } from "express";

// const { firestore } = loadConfiguration();

export const productController = Router();

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
