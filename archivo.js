import {promises as fs} from 'fs';
const RUTA = './exports/historial.json';

export async function leerArchivo(){
    try{
        const contenido = await fs. readFile (RUTA, 'utf8');
        return JSON.parse (contenido);
    } catch (err){
        return [];
    }
}

export async function escribirArchivo(historial){
    await  fs.writeFile (RUTA, JSON.stringify (historial, null, 2));
}
