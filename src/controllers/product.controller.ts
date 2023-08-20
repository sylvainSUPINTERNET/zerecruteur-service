import { loadConfiguration } from "../configuration/firebaseConfig";
import { addProduct } from "../services/product.service";
import { Request, Response, NextFunction, Router } from "express";

const { firestore } = loadConfiguration();

export const productController = Router();

productController.post('/products', async ( req:Request, res:Response, _next:NextFunction ) => {

    await addProduct(firestore, {
        req,
        res
    });

    res.status(200).json({
        "response":"ok"
    })
})
