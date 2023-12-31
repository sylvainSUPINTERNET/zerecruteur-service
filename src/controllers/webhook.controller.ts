import { Router, Request, Response, NextFunction } from "express";
import { loadStripe } from "../configuration/firebaseConfig";
import { prisma as clientDb } from "../prismaClient/prismaClientGenerated";
import { logger } from "../configuration/logger";
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
                const sessionData:any = event.data.object;
            
                if (sessionData.payment_status === 'paid') {



                    const {address, name:nameShipping} = sessionData.shipping_details;
                    const {city, country, line1, line2, postal_code, state} = address;
                    const {email:buyerEmail, phone} = sessionData.customer_details;


                        // Récupérer les line_items associés à cette session
                        const lineItems = await stripe.checkout.sessions.listLineItems(sessionData.id);


                        for ( const item of lineItems.data ) {
                            const {price} = item;                            
                            const productDetail = await stripe.products.retrieve(
                                price?.product as string
                              );
                            
        
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


                            if ( productDb ) {
                                const order = await clientDb.order.create({
                                    data: {
                                            quantity: item.quantity!,
                                            amount: item.amount_total!,
                                            currency: item.currency!,
                                            shippingCity: city,
                                            shippingCountry: country,
                                            shippingLine1: line1,
                                            shippingLine2: line2 || "",
                                            shippingName: nameShipping,
                                            shippingState: state || "",
                                            shippingPostalCode: postal_code,
                                            phoneNumber: phone || "",
                                            buyerEmail: buyerEmail,
                                            paymentIntentId: sessionData.payment_intent
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

                            }

                        }                        
                }

            default:
                // No action planned for this event
                break;   
        }




        return res.status(200).json({
            "response":"webhook success"
        });

      } catch (err:any) {
        logger.error(err);

        return res.status(400).send(`Webhook Error: ${err.message}`);

      }
    

});