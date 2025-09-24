//conexión con otra carpeta que tiene la conexión con la base de datos
import { ObjectId } from "mongodb";
import { conectar } from "./persistenciaArchivos.js";

class PlanEntrenamiento {
    #duracionSemanas
    constructor(nombre, duracionSemanas, metas, nivel,estado="activo") { //estado activo predeterminado
        this.nombre = nombre;
        this.#duracionSemanas = duracionSemanas;
        this.metas = metas;
        this.nivel = nivel;
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

    async renovarPlan(planEntrenamientoId) {
        // conexion con la base de datos y captura de las clases
        const db = await conectar();
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");
        
        //actualizacion del plan
        const actualizacion = await coleccionPlanesEntrenamiento.updateOne(
            {_id: new ObjectId(planEntrenamientoId)},
        {
            $set:{
                nombre:this.nombre,
            duracionSemanas:this.duracionSemanas,
            metas:this.metas,
            nivel:this.nivel,
            estado:"activo"
            },
        }
        
    );
    console.log("Plan renovado exitosamente");
    return actualizacion;
    }

    async cancelarPlan(planEntrenamientoId){
        const db= await conectar();
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");
        
        //cancelacion del plan de entrenamiento

        const cancelacion= await coleccionPlanesEntrenamiento.updateOne(
            {_id:new ObjectId(planEntrenamientoId)},
            {
                $set:{
                    estado:"cancelado"
                }
            }
        );
        console.log("Plan cancelado exitosamnte");
        return cancelacion
    }

    async finalizarPlan(planEntrenamientoId){
        const db= await conectar();
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");

        //finalizacion del plan 
        const finalizacion= await coleccionPlanesEntrenamiento.updateOne(
            {_id: new ObjectId(planEntrenamientoId)},
            {
                $set:{
                    estado:"finalizado"
                }
            }
        );
        console.log("Plan finalizado con éxito");
        return finalizacion 
    }
}

class CrearPlan{
    static CrearPlan(tipo,clienteId){
        switch (tipo.toLowerCase()){
            case "basico":
                const planBasico = new PlanEntrenamiento("plan básico",5,["perder peso"],"principiante");
                planBasico.clienteId=clienteId;
                return planBasico;

            case "intermedio":
                const planIntermedio = new PlanEntrenamiento("plan intermedio",10,["aumentar la fuerza","desarrollo muscular"],"intermedio");
                planIntermedio.clienteId = clienteId;
                return planIntermedio;

            case "avanzado":
                const planAvanzado = new PlanEntrenamiento("plan avanzado",15,["aumentar fuerza","mejorar agilidad y flexibilidad"],"avanzado");
                planAvanzado.clienteId = clienteId;
                return planAvanzado;

            default:
                throw new Error("Tipo no válido");
        }
    }
}
export default PlanEntrenamiento;
export {CrearPlan};
