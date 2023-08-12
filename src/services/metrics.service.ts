import { Firestore, doc, setDoc } from "@firebase/firestore";
import { collection, addDoc } from "firebase/firestore"; 
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction} from "express";


export interface IMetricsServicePayload {
    req: Request,
    res: Response,
    next: NextFunction
}


// TODO : check valid api keys pair
const checkUserHasFootprint = async (cookies: Record<string, any>, req:Request, res:Response) => {
    
    let docId: string = "";

    if ( req.body?.applicationId && cookies && Object.keys(cookies).length !== 0 ) {
        
    } else {
        // No https since we need to manipulate cookie on front side aswell !
        res.cookie('myAppId', 'cookieValue', { maxAge: 2592000000, httpOnly: false });
    }

}

export const metricsService = {

    saveMetrics: async (firestore:Firestore, payload: IMetricsServicePayload) => {

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
