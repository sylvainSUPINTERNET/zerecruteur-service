import { prisma as dbClient } from "../prismaClient/prismaClientGenerated";


interface OrderTotal {
    totalraw: number;
}

export const computeOrdersTotalAmount = async (reqObj:any) : Promise< string | null> => {

    // TODO user can retrieve ONLY his own orders ! 
    
    const specificPaymentLinkId = reqObj.req.query.paymentLink;

    if ( !specificPaymentLinkId ||  specificPaymentLinkId == "") {
        reqObj.res.status(400).json({
            "response": {
                "message": "Payment link not valid",
                "data": []
            }
        });
    }

    
    const result: OrderTotal[] = await dbClient.$queryRaw`
        SELECT SUM("Order"."amount" * "Order".quantity) as totalRaw
        FROM "ProductOrder"
        LEFT JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
        WHERE "ProductOrder"."productId" IN (
            SELECT "Product".id
            FROM "Product"
            INNER JOIN "PaymentLink" ON "PaymentLink".identifier = ${specificPaymentLinkId}
        );
    `;


    try {
        const factor:number = parseFloat("100");
        const val:number = parseFloat(BigInt(result[0].totalraw).toString());
        console.log( (val / factor))
        return (val / factor).toString();
    } catch (error) {
        console.log(error)
        return null;
    }
}