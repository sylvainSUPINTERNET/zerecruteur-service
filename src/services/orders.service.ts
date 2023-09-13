import { prisma as dbClient } from "../prismaClient/prismaClientGenerated";


interface OrderTotal {
    totalraw: number;
}


export const ordersList = async (reqObj:any) => {

    // TODO implement cursor pagination
}

export const computeOrdersTotalAmount = async (reqObj:any) : Promise< string | null> => {

    // TODO user can retrieve ONLY his own orders ! 
    
    const result: OrderTotal[] = await dbClient.$queryRaw`
        SELECT SUM("Order"."amount" * "Order".quantity) as totalRaw
        FROM "ProductOrder"
        LEFT JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
        WHERE "ProductOrder"."productId" IN (
            SELECT "Product".id
            FROM "Product"
            INNER JOIN "PaymentLink" ON "PaymentLink".identifier = ${reqObj.req.query.paymentLink}
        );
    `;


    try {
        const factor:number = parseFloat("100");
        const val:number = parseFloat(BigInt(result[0].totalraw).toString());
        return (val / factor).toString();
    } catch (error) {

        // TODO better logger !!!
        console.log(error)
        return null;
    }
}