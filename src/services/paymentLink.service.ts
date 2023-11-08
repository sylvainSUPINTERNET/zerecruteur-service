import { prisma as dbClient } from "../prismaClient/prismaClientGenerated";


export const getPaymentLinks = async (reqObj:any) : Promise<any[]> => {

    const { email } = reqObj.req.body;

    const userPaymentLinks = await dbClient.paymentLink.findMany({
        where: {
            email: email
        },
        select: {
            id: true,
            identifier: true,
            paymentUrl: true,
            name: true, 
            email: true
        }
    });

    // const userPaymentLinks = await dbClient.user.findMany({
    //     where: {
    //       email: reqObj.req.body.email,
    //     },
    //     select: {
    //         paymentLinks: {
    //             select: {
    //                 id: true,
    //                 identifier: true,
    //                 paymentUrl: true,
    //                 name: true
    //             }
    //         }
    //     }
    //   });

      return userPaymentLinks;
};