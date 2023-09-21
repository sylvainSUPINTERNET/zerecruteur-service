import { Router, Request, Response, NextFunction } from "express";
import { loadStripe } from "../configuration/firebaseConfig";
import { prisma as clientDb } from "../prismaClient/prismaClientGenerated";
const stripe = loadStripe();

export const webhookController = Router();

webhookController.post('/', async ( req:Request, res:Response, _next:NextFunction ) => {

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.WHSEC!);
        
        // const resp = await stripe.paymentLinks.listLineItems( 'plink_1Ni1vxG9WAND04yWTDpYg6ws', {});
        // console.log(resp);

        switch ( event.type ) {
            case 'charge.succeeded':
                const chargeData:any = event.data.object;
                //const pi:any = (await stripe.charges.retrieve(chargeData.id)).payment_intent;
                ///const paymentIntent = await stripe.paymentIntents.retrieve(pi);
                
                // email send automatically in live mode if configured
                // https://dashboard.stripe.com/settings/emails
            
                break;
            case 'checkout.session.completed':
                console.log("session completed");
                const sessionData:any = event.data.object;

                if (sessionData.payment_status === 'paid') {
                        // Récupérer les line_items associés à cette session
                        const lineItems = await stripe.checkout.sessions.listLineItems(sessionData.id);


                        for ( const item of lineItems.data ) {
                            console.log("lineItem", item);
                            const {price} = item;                            
                            const productDetail = await stripe.products.retrieve(
                                price?.product as string
                              );
                            console.log("== product detail ==", productDetail)
                            
        
                            const productDb = await clientDb.product.findFirst({  
                                where: {
                                    stripeId: productDetail.id
                                },
                                select: {
                                    id: true,
                                    stock: true,
                                    paymentLink: {
                                        select: {
                                            stripeId:true
                                        }
                                    }
                                }
                            });
                            
                            if ( productDb!.stock - item.quantity! <= 0 ) {
                                console.log(`Disable link : ${productDb!.paymentLink!.stripeId}, out of stock`)
                                // disable link
                                await stripe.paymentLinks.update(
                                    productDb!.paymentLink!.stripeId,
                                    {active: false}
                                );
                            }

                            // Update stock
                            await clientDb.product.update({
                                where: {
                                    id: productDb!.id
                                },
                                data: {
                                    stock: productDb!.stock - item.quantity!
                                }
                            });

                            console.log("PRODUCT DB", productDb);

                            if ( productDb ) {
                                console.log("product found in DB");
                                const order = await clientDb.order.create({
                                    data: {
                                            quantity: item.quantity!,
                                            amount: item.amount_total!,
                                            currency: item.currency!
                                    }
                                });


                                const productOrder = await clientDb.productOrder.create({
                                    data: {
                                        product: {
                                            connect: {
                                                id: productDb!.id,
                                            }
                                        },
                                        order: {
                                            connect: {
                                                id: order.id,
                                                quantity: item.quantity!
                                            }
                                        }
                                    }
                                });

                                console.log("productOrder created", productOrder);
                            }

                            console.log("create order with success");
                        }

 
                        //TODO
                        
                        console.log("TODO => relation avec le produit creer par l'utilisateur et la vente réalisé")
                }

            default:
                // No action planned for this event
                break;   
        }




        return res.status(200).json({
            "response":"webhook success"
        });

      } catch (err:any) {

        return res.status(400).send(`Webhook Error: ${err.message}`);

      }
    

});