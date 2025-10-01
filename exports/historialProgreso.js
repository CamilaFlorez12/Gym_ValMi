import fs, { write, writeFile } from 'fs';
import {cliente, conectar} from "../utils/persistenciaArchivos.js";
import { isUtf8 } from 'buffer';
import { Collection } from 'mongodb';
import { json } from 'stream/consumers';
import { gestionClientes } from '../services/gestion_clientes.js';
import { error } from 'console';


export async function LeerInfoClientes() {
    try {

        const {db} = await conectar();
        const clientes = db.Collection("clientes");
        const registros = db.coleccion("seguimientos");
        const nutricion = db.Collection("seguimientoNutricional")

        if (!clientes) {
            console.log(" No existe el cliente");
        }
        const resultado = await fs.readFile(registros,nutricion,Utf8)
        return JSON.parse(resultado);
    } catch (error) {
        return [];
    }
    
}

export async function escribirArchivo(informacion) {
    try{
        const {db} = await conectar();
        const registros = db.coleccion("seguimientos");
        const nutricion = db.Collection("seguimientoNutricional")

    await fs.writeFile(registros,nutricion,JSON.stringify(informacion,null,2));
    }catch (error){
        console.log("Error")
    }
    
}