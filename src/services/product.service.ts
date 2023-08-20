import { Request, Response, NextFunction, Router } from "express";
import { loadStripe } from "../configuration/firebaseConfig";





export const addProduct = async (firestore:any, reqObj:any) => {
    const stripe = loadStripe();
    
    // TODO
    // upload file to S3

    const product = await stripe.products.create({
        name: reqObj.req.body.name,
        description: reqObj.req.body.description,
        images: reqObj.req.body.images,
        metadata: {
            category: reqObj.req.body.category,
            subcategory: reqObj.req.body.subcategory,
            price: reqObj.req.body.price,
            currency: reqObj.req.body.currency,
            quantity: reqObj.req.body.quantity,
            sku: reqObj.req.body.sku,
            brand: reqObj.req.body.brand,
            color: reqObj.req.body.color,
            size: reqObj.req.body.size,
            material: reqObj.req.body.material,
        }
    });

    
    const price = await stripe.prices.create({
        unit_amount: reqObj.req.body.price,
        currency: reqObj.req.body.currency,
        product: product.id
    });



    const mockEmail = "sylvain.jolyxxx@gmail.coim"
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
                adjustable_quantity : {
                    enabled: true,
                    minimum: 1,
                    maximum: 10
                }
            }
        ],
        shipping_address_collection : {
            allowed_countries: ['FR', 'DE', 'IT', 'ES', 'GB']
        },
        phone_number_collection : {
            enabled: true
        },
        allow_promotion_codes : true,
        automatic_tax: {
            enabled: true
        },
        after_completion : {
            type: 'hosted_confirmation',
            hosted_confirmation : {
                custom_message: `Thank you for your order! We will email you with updates about your delivery ${mockEmail}`
            }
        }
    });


    // TODO : 
    // Il faut rajouter un webhook pour ecouter les payment par la suite 
    // envoyer une facture quand on reçoit un payment 
    // il faut un mail pro + number pro (  apparait sur les invoices ) 

    console.log("payment link", paymentLink.url);
    console.log("product " , product.id);
    console.log("price ", price.id)
    return product;
}