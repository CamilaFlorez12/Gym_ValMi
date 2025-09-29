//conexión con otra carpeta que tiene la conexión con la base de datos
import { ObjectId } from "mongodb";
import { cliente, conectar } from "../utils/persistenciaArchivos.js";

class PlanEntrenamiento {
    #duracionSemanas
    constructor(nombre, duracionSemanas, metas, nivel, estado = "activo") { //estado activo predeterminado
        if (!nombre || typeof nombre !== "string") {
            throw new Error("El nombre del plan es obligatorio y debe ser un texto.");
        }
        if (!duracionSemanas || isNaN(duracionSemanas) || duracionSemanas <= 0) {
            throw new Error("La duración debe ser un número mayor a 0.");
        }
        if (!Array.isArray(metas) || metas.length === 0) {
            throw new Error("Debe incluir al menos una meta en el plan.");
        }
        if (!nivel || typeof nivel !== "string") {
            throw new Error("El nivel del plan es obligatorio y debe ser un texto.");
        }
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

    

    static async renovarPlan(planEntrenamientoId, nuevasSemanas) {
        // conexion con la base de datos y captura de las clases
        const {db} = await conectar();
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");

        if (!ObjectId.isValid(planEntrenamientoId)) {
            throw new Error("El ID del plan no es válido.");
        }
        const duracion = Number(nuevasSemanas);
        if (isNaN(duracion) || duracion <= 0) throw new Error("La duración debe ser un número mayor a 0");

        const plan = await coleccionPlanesEntrenamiento.findOne({ _id: new ObjectId(planEntrenamientoId) });
        if (!plan) throw new Error("Plan no encontrado");

        //actualizacion del plan
        const actualizacion = await coleccionPlanesEntrenamiento.updateOne(
            { _id: new ObjectId(planEntrenamientoId) },
            {
                $set: {
                    duracionSemanas: duracion,
                    estado: "activo",
                    nombre: plan.nombre,
                    metas: plan.metas,
                    nivel: plan.nivel
                },
            }

        );
        console.log("Plan renovado exitosamente");
        return actualizacion;
    }

    static async cancelarPlan(planEntrenamientoId, clienteId) {
        if (!ObjectId.isValid(planEntrenamientoId)) {
            throw new Error("El ID del plan no es válido.");
        }
        if (!ObjectId.isValid(clienteId)) {
            throw new Error("El ID del cliente no es válido.");
        }
        const {db} = await conectar();
        const session = cliente.startSession();

        //cancelacion del plan de entrenamiento

        try {
            await session.withTransaction(async () => {
                const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");
                const coleccionContratos = db.collection("contratos");
                const coleccionseguimientos = db.collection("seguimientos");
                const plan = await coleccionPlanesEntrenamiento.findOne({ _id: new ObjectId(planEntrenamientoId) });
                if (!plan) throw new Error("El plan no existe.");

                await coleccionPlanesEntrenamiento.updateOne(
                    { _id: new ObjectId(planEntrenamientoId) },
                    { $set: { estado: "cancelado" } },
                    { session }
                );
                await coleccionContratos.deleteOne(
                    { planId: new ObjectId(planEntrenamientoId), clienteId: new ObjectId(clienteId) },
                    { session }
                );
                await coleccionseguimientos.deleteMany(
                    { planId: new ObjectId(planEntrenamientoId), cliente: new ObjectId(clienteId) },
                    { session }
                );
                console.log("Plan,contrato y seguimientos cancelados correctamente");
            });

        } catch (error) {
            console.log("Error, rollback ejecundo", error);
        } finally {
            await session.endSession();
        }
    }

    static async finalizarPlan(planEntrenamientoId) {
        if (!ObjectId.isValid(planEntrenamientoId)) {
            throw new Error("El ID del plan no es válido.");
        }
        const {db} = await conectar();
        const coleccionPlanesEntrenamiento = db.collection("planEntrenamiento");

        const plan = await coleccionPlanesEntrenamiento.findOne({ _id: new ObjectId(planEntrenamientoId) });
        if (!plan) throw new Error("El plan no existe.");
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
    static async CrearPlan(tipo, clienteId) {
        if (!tipo || typeof tipo !== "string") {
            throw new Error("Debe indicar un tipo de plan válido.");
        }
        if (!ObjectId.isValid(clienteId)) {
            throw new Error("El ID del cliente no es válido.");
        }

        let nuevoPlan;

        switch (tipo.toLowerCase()) {
            case "basico":
                nuevoPlan = new PlanEntrenamiento("plan básico", 5, ["perder peso"], "principiante");
                break;
            case "intermedio":
                nuevoPlan = new PlanEntrenamiento("plan intermedio", 10, ["aumentar la fuerza", "desarrollo muscular"], "intermedio");
                break;
            case "avanzado":
                nuevoPlan = new PlanEntrenamiento("plan avanzado", 15, ["aumentar fuerza", "mejorar agilidad y flexibilidad"], "avanzado");
                break;
            default:
                throw new Error("Tipo no válido");
        }

        nuevoPlan.clienteId = clienteId;

     
        const { db } = await conectar();
        const coleccion = db.collection("planEntrenamiento");

        const resultado = await coleccion.insertOne({
            nombre: nuevoPlan.nombre,
            duracionSemanas: nuevoPlan.duracionSemanas,
            metas: nuevoPlan.metas,
            nivel: nuevoPlan.nivel,
            estado: nuevoPlan.estado,
            clienteId: new ObjectId(clienteId),
            fechaCreacion: new Date()
        });
        console.log("Plan creado exitosamente ");

        return { ...nuevoPlan, _id: resultado.insertedId };
    }
}

export default PlanEntrenamiento;
export { CrearPlan };
