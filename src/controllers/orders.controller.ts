import { Router } from "express";
import { computeOrdersTotalAmount, ordersCount, ordersList } from "../services/orders.service";

export const orderController = Router();



orderController.get('/orders', async ( req, res, _next ) => {

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
    
});

orderController.get('/orders/count', async ( req, res, _next ) => {
    
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

});

orderController.get('/orders/total', async ( req, res, _next ) => {

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


});

