import { conectar } from "./persistenciaArchivos.js";
import { clientes } from "./clientes.js";

class Contrato{
    #fechaInicio;
    #fechaFin;
    #condiciones;
    #duracionSemanas;
    #precio;
    constructor(condiciones,duracionSemanas=12,precio,fechaInicio,fechaFin){
        this.#condiciones=condiciones;
        this.#duracionSemanas=duracionSemanas;
        this.#precio=precio;
        this.#fechaInicio=fechaInicio;
        this.#fechaFin=fechaFin;
    }

    get fechaInicio(){
        return this.#fechaInicio;
    }

    get fechaFin(){
        return this.#fechaFin;
    }

    get condiciones(){
        return this.#condiciones;
    }

    get duracionSemanas(){
        return this.#duracionSemanas;
    }

    get precio(){
        return this.#precio;
    }

    set fechaInicio(fechaInicio){
        if (!this.#fechaInicio) {
            this.#fechaInicio = new Date();
            this.#fechaInicio = fechaInicio;
        }
        
    }

    set fechaFin(fechaFin){
        const fin = new Date(this.#fechaInicio);
        fin.setDate(fin.getDate() + this.#duracionSemanas * 7);
        this.#fechaFin = fin;
        this.#fechaFin = fechaFin;
    }

    set condiciones(condiciones){
        this.#condiciones = condiciones;
    }

    set duracionSemanas(duracionSemanas){
        this.#duracionSemanas = duracionSemanas;
    }

    set precio(precio){
        this.#precio = precio;
    }

    async generarAutomaticamente(nombreCliente, nombrePlan){
        if(nombreCliente instanceof clientes.cliente && nombrePlan instanceof planentrenamiento.plan){
             const db = await conectar();
             const coleccionClientes = db.collection("clientes");
             const coleccionEntrenamineto = db.collection("planEntrenamiento");

             const cliente = await coleccionClientes.findOne({nombre:nombreCliente});
             const plan = await coleccionEntrenamineto.findOne({nombre:nombrePlan});

             if(!cliente || !plan){
                throw new Error("El cliente o el plan no existen");
             }

             const creacionContrato = await db.collection("contratos").insertOne({
                cliente: cliente._id,
                plan:plan._id,
                condiciones:this.#condiciones,
                duracionSemanas:this.#duracionSemanas,
                precio:this.precio,
                fechaInicio:this.#fechaInicio,
                fechaFin:this.#fechaFin
             });
             console.log("Contrato generado exitosamente");
             return creacionContrato;
        };

    }

    async renovar(id_contrato){
        const db = await conectar();
        const coleccionContratos = db.collection("contratos");       

        const contrato = await coleccionContratos.findOne({_id:id_contrato});
        if(!contrato){
            throw new Error("El contrato no existe");
        }

        const renovacion = await coleccionContratos.updateOne(
            {_id:id_contrato},
            {$set:{
                fechaInicio: new Date(),
                fechaFin: new Date(this.#fechaInicio).setDate(this.#fechaInicio.getDate() + this.#duracionSemanas *7 ),
                condiciones:this.#condiciones,
                duracionSemanas:this.#duracionSemanas,
                precio:this.#precio
            }}
        );
        console.log("contarto renovado exitosamente");
        return renovacion;
    }

    async cancelar(id_contrato){
        const db = await conectar();
        const coleccionContratos = db.collection("contratos");

        const contrato = await coleccionContratos.findOne({_id:id_contrato});
        if(!contrato){
            throw new Error("El contrato no existe");
        }

        const cancelacion = await coleccionContratos.updateOne(
            {_id:id_contrato},
            {$set:{
                fechaFin: new Date(),
                condiciones:"contrato cancelado"
            }}
        );
        console.log("Contrato cancelado exitosamente");
        return cancelacion;
    }

    async finalizar(id_contrato){
        const db = await conectar();
        const coleccionContratos = db.collection("cotratos");

        const contrato = await coleccionContratos.findOne({_id:id_contrato});
        if(!contrato){
            throw new Error("El contrato no existe");
        }
        
        if(this.fechaFin > fechaFin){
            const finalizacion = await coleccionContratos.updateOne(
            {_id:id_contrato},
            {$set:{
                fechaFin:this.fechaFin,
                condiciones:"contrato finalizado"
            }}
            );
            console.log("contrato finalizado exitosamente");
            return finalizacion;
        }
        
    }

} 