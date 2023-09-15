import { Router } from "express";
import { getPaymentLinks } from "../services/paymentLink.service";

export const paymentLinkController = Router();

paymentLinkController.post('/paymentLink', async ( req, res, _next ) => {
    
    const userPaymentLinks = await getPaymentLinks({req,res});

    return res.status(200).json({
        "response": {
            "message": "Payment link added successfully",
            "data": userPaymentLinks
        }
    });

});

