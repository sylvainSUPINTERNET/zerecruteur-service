import { prisma as dbClient } from "../prismaClient/prismaClientGenerated";


interface OrderTotal {
    totalraw: number;
}

interface CountOrder {
    count: number;
}

interface Order {
    orderId: number;
    productId: number;
    quantity: number;
    createdAt: Date;
    amount: number;
}


export const ordersCount = async ( reqObj: any ) => {

    const resultCount: CountOrder[] = await dbClient.$queryRaw`
            SELECT COUNT(*) as count
            FROM "ProductOrder"
            LEFT JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
            WHERE "ProductOrder"."productId" IN (
                SELECT "Product".id
                FROM "Product"
                INNER JOIN "PaymentLink" ON "PaymentLink".identifier = ${reqObj.req.query.paymentLink}
        ); 
    `;
    
    return  BigInt(resultCount[0].count).toString();

}


// No cursor pagination ( not enough data, no need to implement it)
// but use keySet pagination ( no OFFSET, using id as "offset") + LIMIT increase perf

export const ordersList = async (reqObj:any, offset:number, size:number) => {

    const orders: Order[] = await dbClient.$queryRaw`
    SELECT "orderId", "Order".quantity, "Order"."createdAt", "Order".amount, "Order".currency, "productId"
    FROM "ProductOrder"
    LEFT JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
    WHERE "ProductOrder"."productId" IN (
        SELECT "Product".id
        FROM "Product"
        INNER JOIN "PaymentLink" ON "PaymentLink".identifier = ${reqObj.req.query.paymentLink} ) AND "Order".id > ${offset} ORDER BY "createdAt" ASC LIMIT ${size};
    `

    return orders;
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