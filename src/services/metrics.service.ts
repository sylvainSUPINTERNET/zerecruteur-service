import { Firestore, doc, setDoc } from "@firebase/firestore";
import { collection, addDoc } from "firebase/firestore"; 
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction} from "express";
import { logger } from "../configuration/logger";
import { FirebaseApp } from "firebase/app";

export interface IMetricsServicePayload {
    req: Request,
    res: Response,
    next: NextFunction
}


const checkUserHasFootprint = async (cookies: Record<string, any>, req:Request, res:Response, firestore:Firestore): Promise<string|null> => {

    if ( req.body?.fromUrl && req.body?.applicationId) {
        if ( cookies && Object.keys(cookies).length !== 0 ) { 
            if (cookies[req.body.applicationId]) {
                if ( !cookies[req.body.applicationId].split(',').includes(req.body.fromUrl) ) {
                    // New path detected, update existing cookie
                    let newValue = `${cookies[req.body.applicationId]},${req.body.fromUrl}`;
                    res.cookie( req.body.applicationId, newValue, { maxAge: 2592000000, httpOnly: false });

                    await setDoc(doc(firestore, "users",`${newValue.split(",")[0]}` ), {
                        "test": 2
                    });

                    return newValue.split(",")[0];
                } else {
                    // Not a new path to add
                    return cookies[req.body.applicationId].split(',')[0];
                }
            } else {
                // Cookie not found
                return null;
            }
        } else {
            const val = `${uuidv4()},${req.body.fromUrl}`;
            res.cookie( req.body.applicationId, val, { maxAge: 2592000000, httpOnly: false });
            await setDoc(doc(firestore, "users",`${val.split(",")[0]}` ), {
                "test": 1
            });

            return val.split(",")[0];
        }

    } else {
        logger.error('fromUrl or applicationId is missing in payload')
        return null;
    }

    return null;
}

export const metricsService = {

    saveMetrics: async (firestore:Firestore, payload: IMetricsServicePayload) => {
        const id: string | null = await checkUserHasFootprint(payload.req.cookies, payload.req, payload.res, firestore);
        console.log(id);
    }

};

    // /**
    //  * 
    //  * @param firestore 
    //  * @param ip 
    //  * @param cookies [Object: null prototype] {} (empty object without inherited properties of Object.prototype)
    //  */
    // saveMetrics: async (firestore:Firestore, ip:string | null, cookies: Record<string, any>) => {

    //     checkUserHasFootprint(ip, cookies);

    //     try {

    //         let docRef;

    //         if ( ip === null ) {
    //             docRef = doc(firestore, "users", `${ip}`);
    //         } else {
    //             // auto generate ID
    //             docRef = doc(firestore, "users",`anon_${uuidv4()}` );
    //         }

    //         const resp = await setDoc(docRef, {
    //             "/": {
    //                 "btn-id-1" : {
    //                     "impressions": 1,
    //                 }
    //             },
    //             "/dashboard": {
    //                 "btn-id-2" : {
    //                     "impressions": 10,
    //                 }
    //             },
    //         });

    //         console.log(resp);

    //     } catch ( e ) {
            
    //         console.log(e);

    //     }
    // }
