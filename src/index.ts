import * as dotenv from 'dotenv'
dotenv.config();
import { loadConfiguration } from './configuration/firebaseConfig';
import express from "express";

const {app: firebaseApp } = loadConfiguration();

const PORT:number = 9000;
const app = express();



app.listen(PORT, () => {
    console.log(`API is running on : ${PORT}`);
});