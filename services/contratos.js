import { ObjectId } from "mongodb";
import { cliente, conectar } from "../utils/persistenciaArchivos.js";

class Contrato {
    #fechaInicio;
    #fechaFin;
    #condiciones;
    #duracionSemanas;
    #precio;
    #estado;
    constructor(condiciones, duracionSemanas = 12, precio, fechaInicio, fechaFin) {
        if (!condiciones || typeof condiciones !== "string") {
            throw new Error("Las condiciones del contrato son obligatorias y deben ser texto.");
        }
        if (!duracionSemanas || isNaN(duracionSemanas) || duracionSemanas <= 0) {
            throw new Error("La duración debe ser un número mayor a 0 semanas.");
        }
        if (!precio || isNaN(precio) || precio <= 0) {
            throw new Error("El precio debe ser un número mayor a 0.");
        }

        this.#condiciones = condiciones;
        this.#duracionSemanas = duracionSemanas;
        this.#precio = precio;
        this.#fechaInicio = fechaInicio instanceof Date ? fechaInicio : new Date();;
        this.#fechaFin = null;
        this.#estado = "activo";

    }


    get fechaInicio() {
        return this.#fechaInicio;
    }

    get fechaFin() {
        return this.#fechaFin;
    }

    get condiciones() {
        return this.#condiciones;
    }

    get duracionSemanas() {
        return this.#duracionSemanas;
    }

    get precio() {
        return this.#precio;
    }
    get estado() {
        return this.#estado
    }
    //crecaion de fecha si no hay
    set fechaInicio(fechaInicio) {
        if (!(fechaInicio instanceof Date)) {
            throw new Error("La fecha de inicio debe ser un objeto Date válido.");
        }
        this.#fechaInicio = fechaInicio
        this.#fechaFin = new Date(this.#fechaInicio);
        this.#fechaFin.setDate(this.#fechaInicio.getDate() + this.#duracionSemanas * 7);

    }
    // segun fecha inicio clacula la fecha fin
    set fechaFin(_) {
        const fin = new Date(this.#fechaInicio);
        fin.setDate(fin.getDate() + this.#duracionSemanas * 7);
        this.#fechaFin = fin;
    }

    set condiciones(condiciones) {
        if (!condiciones || typeof condiciones !== "string") throw new Error("Las condiciones deben ser texto válido.");
        this.#condiciones = condiciones;
    }

    set duracionSemanas(duracionSemanas) {
        if (!duracionSemanas || isNaN(duracionSemanas) || duracionSemanas <= 0) {
            throw new Error("La duración debe ser un número mayor a 0 semanas.");
        }
        this.#duracionSemanas = duracionSemanas;
    }

    set precio(precio) {
        if (!precio || isNaN(precio) || precio <= 0) throw new Error("El precio debe ser un número mayor a 0.");
        this.#precio = precio;
    }
    //creacion automatica del contrato
    async generarAutomaticamente(clienteId, planId) {
        if (!ObjectId.isValid(clienteId)) throw new Error("El ID del cliente no es válido.");
        if (!ObjectId.isValid(planId)) throw new Error("El ID del plan no es válido.");

        const db = await conectar();
        const coleccionClientes = db.collection("clientes");
        const coleccionEntrenamineto = db.collection("planEntrenamiento");

        const cliente = await coleccionClientes.findOne({ _id: new ObjectId(clienteId) });
        const plan = await coleccionEntrenamineto.findOne({ _id: new ObjectId(planId) });

        if (!cliente || !plan) {
            throw new Error("El cliente o el plan no existen");
        }

        await db.collection("contratos").insertOne({
            cliente: cliente._id,
            plan: plan._id,
            condiciones: this.#condiciones,
            duracionSemanas: this.#duracionSemanas,
            precio: this.#precio,
            fechaInicio: this.#fechaInicio,
            fechaFin: this.#fechaFin,
            estado: this.#estado
        });
        console.log("Contrato generado exitosamente");
        return true;
    };
    //renovacion del contrato
    async renovar(contratoId) {
        const db = await conectar();
        const coleccionContratos = db.collection("contratos");
        const coleccionSeguimientos = db.collection("seguimientos");

        const session = cliente.startSession();
        try {
            await session.withTransaction(async () => {
                const contrato = await coleccionContratos.findOne({ _id: new ObjectId(contratoId) }, { session });
                if (!contrato) {
                    throw new Error("El contrato no existe");
                }
                if (contrato.estado !== "activo") {
                    throw new Error("Solo se puede renovar un contrato activo");
                }

                await coleccionSeguimientos.insertOne(
                    { contratoId: contrato._id, renovadoEn: new Date() }, { session }

                )
                const nuevaFechaInicio = new Date();
                const nuevaFechaFin = new Date(nuevaFechaInicio);
                nuevaFechaFin.setDate(nuevaFechaInicio.getDate() + this.#duracionSemanas * 7);
                await coleccionContratos.updateOne(
                    { _id: new ObjectId(contratoId) },
                    {
                        $set: {
                            fechaInicio: nuevaFechaInicio,
                            fechaFin: nuevaFechaFin,
                            condiciones: this.#condiciones,
                            duracionSemanas: this.#duracionSemanas,
                            precio: this.#precio
                        }
                    },
                    { session }
                );
            });
            console.log("contarto renovado exitosamente");
            return true;
        } catch (error) {
            console.log("Error al renovar el contrato:", error);
            return false;
        } finally {
            await session.endSession();
        }
    }
    //cancelacion del contrato
    async cancelar(contratoId) {
        if (!ObjectId.isValid(contratoId)) throw new Error("El ID del contrato no es válido.");
        const db = await conectar();
        const coleccionContratos = db.collection("contratos");
        const coleccionSeguimientos = db.collection("seguimientos");

        const session = cliente.startSession();
        try {
            await session.withTransaction(async () => {
                const contrato = await coleccionContratos.findOne({ _id: new ObjectId(contratoId) }, { session });
                if (!contrato) {
                    throw new Error("El contrato no existe");
                }

                await coleccionSeguimientos.deleteMany(
                    { contratoId: contrato._id }, { session }
                )
                await coleccionContratos.updateOne(
                    { _id: contrato._id },
                    {
                        $set: {
                            fechaFin: new Date(),
                            condiciones: "contrato cancelado",
                            estado:"cancelado"
                        }
                    },
                    { session }
                );
            });
            console.log("Contrato cancelado exitosamente");
            return true;
        } catch (error) {
            console.error("Error al cancelar contrato:", error);
            return false

        } finally {
            await session.endSession();
        }
    }

    //finalizacion del contrato
    async finalizar(contratoId) {
        const db = await conectar();
        const coleccionContratos = db.collection("contratos");

        const session = cliente.startSession();
        try {
            await session.withTransaction(async () => {
                const contrato = await coleccionContratos.findOne({ _id: new ObjectId(contratoId) });
                if (!contrato) {
                    throw new Error("El contrato no existe");
                }
        
                await coleccionContratos.updateOne(
                    { _id: contrato._id },
                    {
                        $set: {
                            fechaFin: new Date(),
                            condiciones: "contrato finalizado",
                            estado:"finalizado"
                        }
                    },
                    { session }
                );
            });
            console.log("contrato finalizado exitosamente");
            return true;
        } catch (error) {
            console.log("Error al finalizar contrato:", error);
            return false
        } finally {
            await session.endSession();
        }

    }

}
export default Contrato