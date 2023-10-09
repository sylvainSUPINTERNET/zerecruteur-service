import { Router } from "express";
import { computeOrdersTotalAmount, ordersCount, ordersList, refundOrder, updateOrdersStatus } from "../services/orders.service";
import { logger } from "../configuration/logger";

export const orderController = Router();



orderController.get('/orders', async ( req, res, _next ) => {

    try {
        const specificPaymentLinkId = req.query.paymentLink;
        let offset = req.query.offset || 0;
        let size = req.query.size || 10;
    
        try {
            offset = parseInt(offset as string);
            size = parseInt(size as string);
        } catch ( e ) {
            offset = 0;
            size = 10;
        }
        
        if ( !specificPaymentLinkId ||  specificPaymentLinkId == "") {
            return res.status(400).json({
                "response": {
                    "message": "Payment link not valid",
                    "data": []
                }
            });
        }
    
        return res.status(200).json({
            "response": {
                "message": "Orders list returns successfully",
                "data": await ordersList({req,res}, offset, size)
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

orderController.get('/orders/count', async ( req, res, _next ) => {
    
    try {
        const specificPaymentLinkId = req.query.paymentLink;

        if ( !specificPaymentLinkId ||  specificPaymentLinkId == "") {
            return res.status(400).json({
                "response": {
                    "message": "Payment link not valid",
                    "data": []
                }
            });
        }
        
        return res.status(200).json({
            "response": {
                "message": "Count returns successfully",
                "data": await ordersCount({req,res})
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

orderController.get('/orders/total', async ( req, res, _next ) => {

    try {
        const specificPaymentLinkId = req.query.paymentLink;

        if ( !specificPaymentLinkId ||  specificPaymentLinkId == "") {
            return res.status(400).json({
                "response": {
                    "message": "Payment link not valid",
                    "data": []
                }
            });
        }
        
        const totalRawResult = await computeOrdersTotalAmount({req,res});
        
        if ( totalRawResult == null ) {
            return res.status(400).json({
                "response": {
                    "message": "Failed to compute total amount",
                    "data": ""
                }  
            });
            
        } else {
            return res.status(200).json({
                "response": {
                    "message": "Total amount computed successfully",
                    "data": totalRawResult
                }
            });
        
        }
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

orderController.put('/orders', async ( req, res, _next ) => {
    
    const orderIds = req.body.orderIds;

    try {

        const result = await updateOrdersStatus({req,res});
        return res.status(200).json({
            "response": {
                "message": "Orders status updated successfully",
                "data": orderIds
            }   
        });

    } catch ( e ) {
        logger.error(e);

        return res.status(400).json({   
            "response": {
                "message": "Failed to update orders status",
                "data": orderIds
            }
        });
    }
});

orderController.put('/orders/refund', async ( req, res, _next ) => {

    const paymentIntentId = req.body.paymentIntentId;

    if ( !paymentIntentId || paymentIntentId == "") {
        return res.status(400).json({
            "response": {
                "message": "Payment intent id not valid",
                "data": paymentIntentId
            }

        });
    }

    try {
        const result = await refundOrder({req,res});

        if ( result === null ) {
            return res.status(400).json({
                "response": {
                    "message": "Failed to refund order",
                    "data": paymentIntentId
                }
            });
        }
        
        return res.status(200).json({
            "response": {
                "message": "Order refunded successfully",
                "data": paymentIntentId
            }
        });

    } catch ( e ) {
        logger.error(e);
        
        return res.status(400).json({
            "response": {
                "message": "Failed to refund order",
                "data": paymentIntentId
            }
        });
    }

});



