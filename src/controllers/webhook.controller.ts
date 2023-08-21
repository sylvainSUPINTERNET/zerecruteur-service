import express, { Router, Request, Response, NextFunction } from "express";
import { loadStripe } from "../configuration/firebaseConfig";
const stripe = loadStripe();

export const webhookController = Router();

webhookController.post('/', async ( req:Request, res:Response, _next:NextFunction ) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.WHSEC!);
        console.log(event.type);

        res.status(200).json({
            "response":"webhook success"
        });

      } catch (err:any) {

        res.status(400).send(`Webhook Error: ${err.message}`);

      }
    

});