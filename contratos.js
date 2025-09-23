import { conectar } from "./persistenciaArchivos.js";
import { clientes } from "./clientes.js";

class Contrato{
    constructor(condiciones,duracionSemanas,precio,fechaInicio,fechaFin){
        this.condiciones=condiciones;
        this.duracionSemanas=duracionSemanas;
        this.precio=precio;
        this.fechaInicio=fechaInicio;
        this.fechaFin=fechaFin;
    }

    async generarAutomaticamente(){
        
    }
}