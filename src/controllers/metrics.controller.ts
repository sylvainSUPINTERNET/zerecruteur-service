import { Request, Response, NextFunction, Router } from "express";
import requestId from "request-ip";
import { metricsService } from "../services/metrics.service";
import { loadConfiguration } from "../configuration/firebaseConfig";
import { logger } from "../configuration/logger";

const { firestore } = loadConfiguration();

export const metricsController = Router();

metricsController.post('/metrics', async ( req:Request, res:Response, next:NextFunction ) => {

    try {
        await metricsService.saveMetrics(firestore, {
            req,
            res,
            next
        });
    
        res.status(200).json({
            "message": requestId.getClientIp(req)
        });
    } catch ( e ) {

        logger.error(e);

        res.status(500).json({
            "message": "Internal server error"
        });
    }

})



