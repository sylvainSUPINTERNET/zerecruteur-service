import { Router } from "express";
import { getPaymentLinks } from "../services/paymentLink.service";
import { logger } from "../configuration/logger";

export const paymentLinkController = Router();

paymentLinkController.post('/paymentLink', async ( req, res, _next ) => {
    
    try { 
        const userPaymentLinks = await getPaymentLinks({req,res});

        return res.status(200).json({
            "response": {
                "message": "Payment link added successfully",
                "data": userPaymentLinks
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

