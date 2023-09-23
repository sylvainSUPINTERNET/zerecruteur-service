import { loadStripe } from "../configuration/firebaseConfig";
import { prisma as dbClient } from "../prismaClient/prismaClientGenerated";
import { v4 as uuidv4 } from 'uuid';


export const productByPaymentLinkIdentifier = async (reqObj:any) => {

    // TODO check validty 
    const {identifier} : {identifier: string} = reqObj.req.body;
    

    const product = await dbClient.product.findFirst({
        where : {
            paymentLink : {
                identifier
            }
        },
        select: {
            name: true,
            stock: true
        }
    });
 

    if ( product ) {
        return product;
    }

    return null;

}

export const addProduct = async (reqObj:any) => {
    const stripe = loadStripe();

    reqObj.req.body.price = reqObj.req.body.price * 100;

    const product = await stripe.products.create({
        name: reqObj.req.body.name,
        description: reqObj.req.body.description,
        images: reqObj.req.body.images,
        metadata: {
            category: reqObj.req.body.category,
            subcategory: reqObj.req.body.subcategory,
            price: reqObj.req.body.price,
            currency: reqObj.req.body.currency,
        }
    });

    
    const price = await stripe.prices.create({
        unit_amount: reqObj.req.body.price,
        currency: reqObj.req.body.currency,
        product: product.id
    });


    // TODO use real email
    const mockEmail = "sylvain.jolyxxx@gmail.coim"
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
                adjustable_quantity : {
                    enabled: true,
                    minimum: 1,
                    maximum: 999
                }
            }
        ],

        // TODO ?
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
                // TODO use real email
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
                    },
                    identifier: uuidv4(),
                    iban: reqObj.req.body.iban,
                    paymentUrl: paymentLink.url,
                    stripeId: paymentLink.id
                }
        });

        const productDb = await dbClient.product.create({
            data : {    
                name: reqObj.req.body.name,
                description: reqObj.req.body.description,
                pictureUrl : product.images[0],
                stripeId: product.id,
                paymentLink: {
                    connect : {
                        id : paymentLinkDb.id
                   }
                },
                stock: parseInt(reqObj.req.body.quantity),
            }
        });

        await dbClient.price.create({
            data : {
                product : {
                    connect : {
                        id : productDb.id,
                    }
                },
                priceStripeId: price.id
            }
        });
        console.log("save price to DB")
    }

    console.log("payment link", paymentLink.url);
    console.log("product " , product.id);
    console.log("price ", price.id)



    return product;
}