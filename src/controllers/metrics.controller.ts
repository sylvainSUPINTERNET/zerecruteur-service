import { Request, Response, NextFunction, Router } from "express";
import requestId from "request-ip";
import { metricsService } from "../services/metrics.service";
import { loadConfiguration } from "../configuration/firebaseConfig";

const { firestore } = loadConfiguration();

export const metricsController = Router();

metricsController.get('/metrics', async ( req:Request, res:Response, next:NextFunction ) => {

    await metricsService.saveMetrics(firestore, {
        req,
        res,
        next
    });

    res.status(200).json({
        "message": requestId.getClientIp(req)
    });
})



