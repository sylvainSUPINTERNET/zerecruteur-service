import { Prisma } from "@prisma/client";
import { prisma as dbClient } from "../prismaClient/prismaClientGenerated";
import { loadStripe } from "../configuration/firebaseConfig";
import Stripe from "stripe";
const stripe = loadStripe();


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
    status: "pending" | "shipped";
    refund: boolean;
    paymentIntentId: string;
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
            "Order"."status",
            "Order"."refund",
            "Order"."paymentIntentId",
            RelevantProducts.name AS productName -- ajout du nom du produit ici
        FROM "ProductOrder"
        JOIN "Order" ON "Order".id = "ProductOrder"."orderId"
        JOIN RelevantProducts ON RelevantProducts.id = "ProductOrder"."productId" -- jointure avec RelevantProducts
        WHERE "ProductOrder"."productId" IN (SELECT id FROM RelevantProducts)
        ORDER BY "createdAt" DESC
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

        let val: number = 0;

        if ( result[0].totalraw !== null ) {
            val = parseFloat(BigInt(result[0].totalraw).toString());
        }
 
        return (val / factor).toString();
    } catch (error) {

        // TODO better logger !!!
        console.log(error)
        return null;
    }
}

export const updateOrdersStatus = async (reqObj:any) => {
    const ids  = reqObj.req.body.orderIds as number[];

    try {

        const result = await dbClient.$queryRaw`
        UPDATE "Order"
            SET status = CASE
            WHEN status = 'pending' THEN 'shipped'
            WHEN status = 'shipped' THEN 'pending'
            ELSE status
            END
            WHERE id IN (${Prisma.join(ids)});
        `
        return result;

    } catch ( e ) {
        console.log(e);
        return null;
    }
}

export const refundOrder = async ( reqObj:any ) => {

    const paymentId:string  = reqObj.req.body.paymentIntentId as string;

    try {
        const pi:Stripe.PaymentIntent= await stripe.paymentIntents.retrieve(paymentId);

        if ( !pi || pi === null ) {
            return null;
        }

        if ( pi.latest_charge === null ) {
            return null;
        }

        const ch:Stripe.Charge = await stripe.charges.retrieve(pi.latest_charge?.toString() as string);

        if ( !ch || ch === null ) {
            return null;
        }

        const refund = await stripe.refunds.create({
            charge: ch.id,
            amount: ch.amount,
        });

        if ( !refund || refund === null ) {
            return null;
        }

        const result = await dbClient.order.update({
            where: {
                paymentIntentId: paymentId
            },
            data: {
                refund: true
            }
        })
        return result;

    } catch ( e ) {
        console.log(e);
        return null;
    }

}