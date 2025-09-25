import { ObjectId } from "mongodb";
import { cliente, conectar } from "./persistenciaArchivos.js";

class Contrato {
    #fechaInicio;
    #fechaFin;
    #condiciones;
    #duracionSemanas;
    #precio;
    constructor(condiciones, duracionSemanas = 12, precio, fechaInicio, fechaFin) {
        this.#condiciones = condiciones;
        this.#duracionSemanas = duracionSemanas;
        this.#precio = precio;
        this.#fechaInicio = fechaInicio;
        this.#fechaFin = fechaFin;
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
//crecaion de fecha si no hay
    set fechaInicio(fechaInicio) {
        if (!this.#fechaInicio) {
            this.#fechaInicio = new Date();
            this.#fechaInicio = fechaInicio;
        }

    }
// segun fecha inicio clacula la fecha fin
    set fechaFin(fechaFin) {
        const fin = new Date(this.#fechaInicio);
        fin.setDate(fin.getDate() + this.#duracionSemanas * 7);
        this.#fechaFin = fin;
        this.#fechaFin = fechaFin;
    }

    set condiciones(condiciones) {
        this.#condiciones = condiciones;
    }

    set duracionSemanas(duracionSemanas) {
        this.#duracionSemanas = duracionSemanas;
    }

    set precio(precio) {
        this.#precio = precio;
    }
//creacion automatica del contrato
    async generarAutomaticamente(clienteId, planId) {
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
            fechaFin: this.#fechaFin
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

                await coleccionSeguimientos.insertOne(
                    { _id: new ObjectId(contratoId) }, { session }

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
            return renovar;
        } catch (error) {
            console.log("Error al renovar el contrato:", error);
            return false;
        } finally {
            await session.endSession();
        }
    }
//cancelacion del contrato
    async cancelar(contratoId) {
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
                    { _id: contrato._id},
                    {
                        $set: {
                            fechaFin: new Date(),
                            condiciones: "contrato cancelado"
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
                    { contratoId: contrato._id }, { session }
                )
                await coleccionContratos.updateOne(
                    { _id: contrato._id },
                    {
                        $set: {
                            fechaFin: this.#fechaFin,
                            condiciones: "contrato finalizado"
                        }
                    },
                    { session }
                );
            });
            console.log("contrato finalizado exitosamente");
            return true;
        } catch (error) {
            console.log("Error al finalizar contrato:",error);
            return false
        }finally{
            await session.endSession();
        }

    }

}
export default Contrato