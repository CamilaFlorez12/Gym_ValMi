import fs from "fs/promises";
import { cliente, conectar } from "../utils/persistenciaArchivos.js";
import { isUtf8 } from 'buffer';
import { Collection } from 'mongodb';
import { json } from 'stream/consumers';
import { gestionClientes } from './gestion_clientes.js';
import { error } from 'console';

const rutaArchivo = "./exports/reporteCliente.json"
export async function LeerInfoClientes() {
    try {

        const contenido = await fs.readFile(rutaArchivo, "utf8");
        const clientes = JSON.parse(contenido);
        console.log("Contenido de archivo");
        console.log(clientes);
        return clientes
    } catch (error) {
        console.log("Errror al leer archivo", error);
        return [];
    }

}

export async function escribirArchivo(datos) {
    try {
        await fs.writeFile(rutaArchivo, JSON.stringify(datos, null, 2));
        console.log("Archivo guardado correctamente en", rutaArchivo);

    } catch (error) {
        console.log("Error",error)
    }

}