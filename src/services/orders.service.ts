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
    shippingCity: string;
    shippingCountry: string;
    shippingLine1: string;
    shippingLine2: string;
    shippingPostalCode: string;
    shippingState: string;
    shippingName: string;
    phoneNumber: string;
    buyerEmail: string;
    productname: string;
}


export const ordersCount = async ( reqObj: any ) => {

    const resultCount: CountOrder[] = await dbClient.$queryRaw`

        SELECT COUNT(*) as count
        FROM "ProductOrder"
        INNER JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
        INNER JOIN "Product" ON "ProductOrder"."productId" = "Product".id
        INNER JOIN "PaymentLink" ON "Product"."paymentLinkId" = "PaymentLink".id
        WHERE "PaymentLink".identifier =  ${reqObj.req.query.paymentLink};
    `;
    
    return  BigInt(resultCount[0].count).toString();

}


// No cursor pagination ( not enough data, no need to implement it)
// but use keySet pagination ( no OFFSET, using id as "offset") + LIMIT increase perf

// export const ordersList = async (reqObj:any, offset:number, size:number) => {

//     const orders: Order[] = await dbClient.$queryRaw`
//     WITH RelevantProducts AS (
//     SELECT "Product".id
//     FROM "Product"
//         WHERE "Product".id IN (
//             SELECT "Product".id
//             FROM "Product"
//             INNER JOIN "PaymentLink" ON "Product"."paymentLinkId" = "PaymentLink".id
//             WHERE "PaymentLink".identifier = ${reqObj.req.query.paymentLink}
//         )
//     )
//     SELECT "orderId", "Order".quantity, "Order"."createdAt", "Order".amount, "Order".currency, "productId",
//     "Order"."shippingCity", "Order"."shippingCountry", "Order"."shippingLine1", "Order"."shippingLine2", "Order"."shippingName","Order"."shippingState", "Order"."shippingPostalCode", "Order"."phoneNumber", "Order"."buyerEmail"
//     FROM "ProductOrder"
//     JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
//     WHERE "ProductOrder"."productId" IN (SELECT id FROM RelevantProducts)
//     AND "Order".id > ${offset}
//     ORDER BY "createdAt" ASC LIMIT ${size};
//     `

//     return orders;
// }

// TODO : using keyset pagination  ( with creation date as offset) for performance later
export const ordersList = async (reqObj:any, offset:number, size:number) => {

    const orders: Order[] = await dbClient.$queryRaw`
        WITH RelevantProducts AS (
            SELECT "Product".id, "Product".name
            FROM "Product"
            WHERE "Product".id IN (
                SELECT "Product".id
                FROM "Product"
                INNER JOIN "PaymentLink" ON "Product"."paymentLinkId" = "PaymentLink".id
                WHERE "PaymentLink".identifier = ${reqObj.req.query.paymentLink}
            )
        )

        SELECT
            "ProductOrder"."orderId",
            "Order".quantity,
            "Order"."createdAt",
            "Order".amount,
            "Order".currency,
            "Order"."shippingCity",
            "Order"."shippingCountry",
            "Order"."shippingLine1",
            "Order"."shippingLine2",
            "Order"."shippingName",
            "Order"."shippingState",
            "Order"."shippingPostalCode",
            "Order"."phoneNumber",
            "Order"."buyerEmail",
            RelevantProducts.name AS productName -- ajout du nom du produit ici
        FROM "ProductOrder"
        JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
        JOIN RelevantProducts ON RelevantProducts.id = "ProductOrder"."productId" -- jointure avec RelevantProducts
        WHERE "ProductOrder"."productId" IN (SELECT id FROM RelevantProducts)
        ORDER BY "createdAt" ASC
        LIMIT ${size} OFFSET ${offset};

    `

    return orders;
}


// export const ordersList = async (reqObj:any, offset:Date, size:number) => {
//     let lastCreatedAt = offset;

//     const orders: Order[] = await dbClient.$queryRaw`WITH RelevantProducts AS (
//         SELECT "Product".id
//         FROM "Product"
//         WHERE "Product".id IN (
//             SELECT "Product".id
//             FROM "Product"
//             INNER JOIN "PaymentLink" ON "Product"."paymentLinkId" = "PaymentLink".id
//             WHERE "PaymentLink".identifier = ${reqObj.req.query.paymentLink}
//         )
//     )
//     SELECT "orderId", 
//            "Order".quantity, 
//            "Order"."createdAt", 
//            "Order".amount, 
//            "Order".currency, 
//            "productId",
//            "Order"."shippingCity", 
//            "Order"."shippingCountry", 
//            "Order"."shippingLine1", 
//            "Order"."shippingLine2", 
//            "Order"."shippingName",
//            "Order"."shippingState", 
//            "Order"."shippingPostalCode", 
//            "Order"."phoneNumber", 
//            "Order"."buyerEmail"
//     FROM "ProductOrder"
//     JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
//     WHERE "ProductOrder"."productId" IN (SELECT id FROM RelevantProducts)
//     AND "Order"."createdAt" > ${lastCreatedAt}
//     ORDER BY "Order"."createdAt" ASC LIMIT ${size};
//     `

//     return orders;
// }


export const computeOrdersTotalAmount = async (reqObj:any) : Promise< string | null> => {

    // TODO user can retrieve ONLY his own orders ! 
    
    const result: OrderTotal[] = await dbClient.$queryRaw`
     SELECT SUM("Order"."amount" * "Order".quantity) as totalRaw
        FROM "ProductOrder"
        LEFT JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
        WHERE "ProductOrder"."productId" IN (
            SELECT "Product".id
            FROM "Product"
            WHERE "Product"."paymentLinkId" IN (
                SELECT "PaymentLink".id
                FROM "PaymentLink"
                WHERE "PaymentLink".identifier = ${reqObj.req.query.paymentLink}
            )
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