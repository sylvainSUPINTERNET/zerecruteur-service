import { prisma as dbClient } from "../prismaClient/prismaClientGenerated";


export const getPaymentLinks = async (reqObj:any) : Promise<any[]> => {
    const userPaymentLinks = await dbClient.user.findMany({
        where: {
          email: reqObj.req.body.email,
        },
        select: {
            paymentLinks: {
                select: {
                    id: true,
                    identifier: true,
                    paymentUrl: true,
                    name: true
                }
            }
        }
      });

      return userPaymentLinks;
};