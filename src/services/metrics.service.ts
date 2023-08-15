import {  Firestore, doc, setDoc, collection, addDoc, updateDoc, DocumentData, DocumentReference,getDoc, FieldValue, DocumentSnapshot  } from "firebase/firestore";

import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction} from "express";
import { logger as LOG } from "../configuration/logger";
import { FirebaseApp } from "firebase/app";

export interface IMetricsServicePayload {
    req: Request,
    res: Response,
    next: NextFunction
}


export interface ElementPayload {
    id: string,
    htmlTag: string,
    actions: [
        {
            name: string,
            count: number
        }
    ]
}

/**
 * Handle cookie and create / update entry in database if it's required
 */
const upsertMetrics = async ( cookies: Record<string, any>, req:Request, res:Response, firestore:Firestore): Promise<string|null> => {

    if ( !req.body?.fromUrl || !req.body?.applicationId || !req.body?.elements) {
        LOG.error('fromUrl or applicationId or elements is missing in payload');
        return null;
    }

    try {

        if ( cookies && Object.keys(cookies).length !== 0 && Object.keys(cookies).includes(req.body.applicationId)) {

            // Check if entry in database exists for this uuid
            const id = cookies[req.body.applicationId].split(",")[0];

            const docSnapshot:DocumentSnapshot = await getDoc(doc(firestore, "users", `${id}`));

            if (docSnapshot.exists()) {

                // TODO => 
                // il faut utiliser dans setDoc l'option "merge" et mettre uniquement les champs qu'on a bnesoin à jour 
                // await setDoc(washingtonRef, {
                //   population: FieldValue.increment(50)
                // }, { merge: true });

                // update
                LOG.info("Update entry : " + id);
                const { pathsVisited } = docSnapshot.data(); 
                

                await setDoc(doc(firestore, "users",`${id}` ), {
                    "updatedAt": new Date().toISOString(),
                    "pathsVisited": {
                        ...pathsVisited,
                        [`${req.body.fromUrl}`]: [...req.body.elements as Array<ElementPayload>]
                    }
                });
                
                return id;

            } else {

                // create new entry ( imagine user delete cookie during process)
                LOG.info("create new entry " + id);
                const val = `${uuidv4()},${req.body.fromUrl}`;
                res.cookie( req.body.applicationId, val, { maxAge: 2592000000, httpOnly: false });
                await setDoc(doc(firestore, "users",`${val.split(",")[0]}` ), {
                    "createdAt": new Date().toISOString(),
                    "updatedAt": null,
                    "pathsVisited": {
                        [`${req.body.fromUrl}`]: [...req.body.elements as Array<ElementPayload>]
                    }
                });
    
                return val.split(",")[0];
                
            }

        } else {

            LOG.info('Cookie not found for ' + req.body.applicationId + " create new one ...");
            // create new cookie
            const val = `${uuidv4()},${req.body.fromUrl}`;
            res.cookie( req.body.applicationId, val, { maxAge: 2592000000, httpOnly: false });
            await setDoc(doc(firestore, "users",`${val.split(",")[0]}` ), {
                "createdAt": new Date().toISOString(),
                "updatedAt": null,
                "pathsVisited": {
                    [`${req.body.fromUrl}`]: [...req.body.elements as Array<ElementPayload>]
                }
            });

            return val.split(",")[0];
        }
        

    } catch ( e ) {
        LOG.error(e);
        res.clearCookie(req.body.applicationId);
        return null;
    }

    return null;
}


export const metricsService = {

    saveMetrics: async (firestore:Firestore, payload: IMetricsServicePayload) => {
        const id: string | null = await upsertMetrics(payload.req.cookies, payload.req, payload.res, firestore);
        if ( id === null ) {
            LOG.error('Failed to create / analysis cookie for footprint');
            return;
        } else {
            LOG.info(`user id: ${id}`)

        }
    }

};