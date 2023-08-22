import { Router, Request, Response, NextFunction } from "express";
import { loadStripe } from "../configuration/firebaseConfig";
const stripe = loadStripe();

export const webhookController = Router();

webhookController.post('/', async ( req:Request, res:Response, _next:NextFunction ) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.WHSEC!);

        switch ( event.type ) {
            case 'charge.succeeded':
                const chargeData:any = event.data.object;

                const pi:any = (await stripe.charges.retrieve(chargeData.id)).payment_intent;
                console.log("now<ay")
                const paymentIntent = await stripe.paymentIntents.retrieve(pi);
                console.log(paymentIntent);
                console.log("DAMN")
                break;
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