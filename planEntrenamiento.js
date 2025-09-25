//conexión con otra carpeta que tiene la conexión con la base de datos
import { ObjectId } from "mongodb";
import { cliente, conectar } from "./persistenciaArchivos.js";

class PlanEntrenamiento {
    #duracionSemanas
    constructor(nombre, duracionSemanas, metas, nivel, estado = "activo") { //estado activo predeterminado
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
            { _id: new ObjectId(planEntrenamientoId) },
            {
                $set: {
                    nombre: this.nombre,
                    duracionSemanas: this.duracionSemanas,
                    metas: this.metas,
                    nivel: this.nivel,
                    estado: "activo"
                },
            }

        );
        console.log("Plan renovado exitosamente");
        return actualizacion;
    }

    async cancelarPlan(planEntrenamientoId,clienteId) {
        const db = await conectar();
        const session = cliente.startSession();

        //cancelacion del plan de entrenamiento

        try {
            await session.withTransaction(async () => {
                const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");
                const coleccionContratos = db.collection("contratos");
                const coleccionseguimientos = db.collection("seguimientos");

                await coleccionPlanesEntrenamiento.updateOne(
                    { _id: new ObjectId(planEntrenamientoId) },
                    {$set: {estado: "cancelado"}},
                    {session}
                );
                await coleccionContratos.deleteOne(
                    {planId: new ObjectId(planEntrenamientoId),clienteId:new ObjectId(clienteId)},
                    {session}
                );
                await coleccionseguimientos.deleteMany(
                    {planId: new ObjectId(planEntrenamientoId),cliente:new ObjectId(clienteId)},
                    {session}
                );
                console.log("Plan,contrato y seguimientos cancelados correctamente");
            });

        } catch (error) {
            console.log("Error, rollback ejecundo",error);
            }finally{
                await session.endSession();
            }
        }

    async finalizarPlan(planEntrenamientoId) {
        const db = await conectar();
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");

        //finalizacion del plan 
        const finalizacion = await coleccionPlanesEntrenamiento.updateOne(
            { _id: new ObjectId(planEntrenamientoId) },
            {
                $set: {
                    estado: "finalizado"
                }
            }
        );
        console.log("Plan finalizado con éxito");
        return finalizacion
    }
}

class CrearPlan {
    static CrearPlan(tipo, clienteId) {
        switch (tipo.toLowerCase()) {
            case "basico":
                const planBasico = new PlanEntrenamiento("plan básico", 5, ["perder peso"], "principiante");
                planBasico.clienteId = clienteId;
                return planBasico;

            case "intermedio":
                const planIntermedio = new PlanEntrenamiento("plan intermedio", 10, ["aumentar la fuerza", "desarrollo muscular"], "intermedio");
                planIntermedio.clienteId = clienteId;
                return planIntermedio;

            case "avanzado":
                const planAvanzado = new PlanEntrenamiento("plan avanzado", 15, ["aumentar fuerza", "mejorar agilidad y flexibilidad"], "avanzado");
                planAvanzado.clienteId = clienteId;
                return planAvanzado;

            default:
                throw new Error("Tipo no válido");
        }
    }
}
export default PlanEntrenamiento;
export { CrearPlan };
