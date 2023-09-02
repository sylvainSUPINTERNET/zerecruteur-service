import { Request, Response, NextFunction, Router } from "express";
import { loadStripe } from "../configuration/firebaseConfig";
import { prisma as dbClient } from "../prismaClient/prismaClientGenerated";



export const addProduct = async (firestore:any, reqObj:any) => {
    const stripe = loadStripe();

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


    //TODO use real oauth2 user 
    const user = await dbClient.user.findUnique({
        where : {
            email : "email@email.com"
        }
    });

    if ( user ) {
        
        const paymentLinkDb = await dbClient.paymentLink.create({
                data : {
                    user : {
                        connect : {
                            id : user.id
                        }
                    }
                }
        });

        const productDb = await dbClient.product.create({
            data : {    
                name: reqObj.req.body.name,
                description: reqObj.req.body.description,
                pictureUrl : product.images[0],
                paymentLink: {
                    connect : {
                        id : paymentLinkDb.id
                   }
                }
            }
        });

        const priceDb = await dbClient.price.create({
            data : {
                product : {
                    connect : {
                        id : productDb.id
                    }
                }
            }
        });
        console.log("save price to DB")
    }

    console.log("payment link", paymentLink.url);
    console.log("product " , product.id);
    console.log("price ", price.id)

    return product;
}