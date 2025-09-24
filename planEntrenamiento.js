import { clientes } from "./clientes.js";
//conexión con otra carpeta que tiene la conexión con la base de datos
import { conectar } from "./persistenciaArchivos.js";

class PlanEntrenamiento {
    #duracionSemanas
    constructor(nombre, duracionSemanas, metas, nivel,estado="activo") { //estado activo predeterminado
        this.nombre = nombre;
        this.#duracionSemanas = duracionSemanas;
        this.metas = metas;
        this.nivel = nivel;
        this.cliente = null;
        this.estado = estado

    }

    get duracionSemanas() {
        return this.#duracionSemanas;
    }

    set duracionSemanas(duracion) {
        if (duracion <= 0)
            throw new Error("La duración debe ser mayor a cero semanas");
        this.#duracionSemanas = duracion;
    }

    async renovarPlan(nombreCliente) {
        // conexion con la base de datos y captura de las clases
        const db = await conectar();
        const coleccionClientes = db.collection("clientes");
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");

        //busqueda de la base de datos clientes para validar que exista o que ya haya creado un plan

        const cliente = await coleccionClientes.findOne({nombre:nombreCliente});

        if(!cliente){
            throw new Error("El cliente no existe")
        }
        
        //actualizacion del plan
        const actualizacion = await coleccionPlanesEntrenamiento.updateOne(
            {cliente:nombreCliente},
        {
            $set:{
                nombre:this.nombre,
            duracionSemanas:this.duracionSemanas,
            metas:this.metas,
            nivel:this.nivel,
            cliente:nombreCliente
            },
        }
        
    );
    console.log(`Plan actualizado ${actualizacion.modifiedCount}`)
    }

    async cancelarPlan(nombreCliente){
        const db= await conectar();
        const coleccionClientes = db.collection("clientes");
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");
        
        //busqueda de la base de datos clientes para validar que exista o que ya haya creado un plan

        const cliente = await coleccionClientes.findOne({nombre:nombreCliente});
         if(!cliente){
            throw new Error("El cliente no existe")
        }

        //cancelacion del plan de entrenamiento

        const cancelacion= await coleccionPlanesEntrenamiento.updateOne(
            {cliente:nombreCliente},
            {
                $set:{
                    estado:"cancelado"
                }
            }
        );
        console.log(`Plan cancelado ${cancelacion.modifiedCount}`);
    }

    async finalizarPlan(nombreCliente){
        const db= await conectar();
        const coleccionClientes = db.collection("clientes");
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");
         //busqueda de la base de datos clientes para validar que exista o que ya haya creado un plan

        const cliente = await coleccionClientes.findOne({nombre:nombreCliente});
         if(!cliente){
            throw new Error("El cliente no existe")
        }

        //finalizacion del plan 
        const finalizacion= await coleccionPlanesEntrenamiento.updateOne(
            {cliente:nombreCliente},
            {
                $set:{
                    estado:"Finalizado"
                }
            }
        );
        console.log(`Plan finalizado ${finalizacion.modifiedCount}`) 
    }
}

class CrearPlan{
    static CrearPlan(tipo,nombreCliente){
        switch (tipo.toLowerCase()){
            case "basico":
                const planBasico = new PlanEntrenamiento("plan básico",5,["perder peso"],"principiante");
                planBasico.cliente=nombreCliente;
                return planBasico;

            case "intermedio":
                const planInteremedio = new PlanEntrenamiento("plan intermedio",10,["aumentar la fuerza","desarrollo muscular"],"intermedio");
                planInteremedio.cliente = nombreCliente;
                return planInteremedio;

            case "avanzado":
                const planAvanzado = new PlanEntrenamiento("plan avanzado",15,["aumentar fuerza","mejorar agilidad y flexibilidad"],"avanzado");
                planAvanzado.cliente = nombreCliente;
                return planAvanzado;

            default:
                throw new Error("Tipo no válido");
        }
    }
}
export default PlanEntrenamiento;
