import { Router, Request, Response, NextFunction } from "express";
import { loadStripe } from "../configuration/firebaseConfig";
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
                const pi:any = (await stripe.charges.retrieve(chargeData.id)).payment_intent;
                console.log("now<ay")
                const paymentIntent = await stripe.paymentIntents.retrieve(pi);
                console.log(paymentIntent.metadata);
                console.log("DAMN")
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
                        }

                        //TODO
                        
                        console.log("TODO => relation avec le produit creer par l'utilisateur et la vente réalisé")
                }

            default:
                // No action planned for this event
                break;
        }




        res.status(200).json({
            "response":"webhook success"
        });

      } catch (err:any) {

        res.status(400).send(`Webhook Error: ${err.message}`);

      }
    

});