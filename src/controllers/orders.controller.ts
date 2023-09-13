import { Router } from "express";
import { computeOrdersTotalAmount } from "../services/orders.service";

export const orderController = Router();

orderController.get('/orders/total', async ( req, res, _next ) => {
    
    const totalRawResult = await computeOrdersTotalAmount({req,res});
    
    if ( totalRawResult == null ) {
        res.status(400).json({
            "response": {
                "message": "Failed to compute total amount",
                "data": ""
            }  
        });
        
    } else {
        res.status(200).json({
            "response": {
                "message": "Total amount computed successfully",
                "data": totalRawResult
            }
        });
    
    }


});

