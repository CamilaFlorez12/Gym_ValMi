import { conectar } from "./persistenciaArchivos.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";


class Seguimiento_fisico {
    constructor(clienteId, planId) {
        this.clienteId = clienteId;
        this.planId = planId;
        this.registros = [];
    }

    async registrarAvance({ peso, grasa, medidas, fotos = [], comentario }) {
        const cliente = await conectar();
        const session = cliente.client.startSession();

        try {
            const db = cliente;
            const seguimientos = db.collection("seguimientos"); // CREA COLECCION SEGUIMIENTOS

            await session.withTransaction(async () => {

                let seguimiento = await seguimientos.findOne(
                    { clienteId: this.clienteId, planId: this.planId },
                    { session }
                );


                if (!seguimiento) {
                    await seguimientos.insertOne(
                        {
                            clienteId: this.clienteId,
                            planId: this.planId,
                            registros: [],
                            creadoEn: new Date(),
                        },
                        { session }
                    );
                    seguimiento = await seguimientos.findOne(
                        { clienteId: this.clienteId, planId: this.planId },
                        { session }
                    );
                }

                // Insertar registro de seguimiento
                const registro = {
                    _id: new ObjectId(),
                    fecha: new Date(),
                    peso,
                    grasa,
                    medidas,
                    fotos,
                    comentario,
                };

                await seguimientos.updateOne(
                    { _id: seguimiento._id },
                    { $push: { registros: registro } },
                    { session }
                );
            });

            console.log("Avance registrado correctamente.");
        } catch (error) {
            console.error("Error registrando avance:", error);
        } finally {
            await session.endSession();
        }
    }

    // Ver progreso cronológico
    async verProgreso() {
        const db = await conectar();
        const seguimientos = db.collection("seguimientos");

        const seguimiento = await seguimientos.findOne({
            clienteId: this.clienteId,
            planId: this.planId,
        });

        if (!seguimiento) {
            console.log("No hay registros de seguimiento para este cliente.");
            return;
        }

        const registros = (seguimiento.registros || []).sort(
            (a, b) => new Date(a.fecha) - new Date(b.fecha)
        );

        console.table(
            registros.map((r) => ({
                Fecha: dayjs(r.fecha).format("YYYY-MM-DD"),
                Peso: r.peso,
                Grasa: r.grasa,
                Medidas: r.medidas,
                Comentario: r.comentario,
            }))
        );
    }

    // Eliminar registro y opcionalmente cancelar plan y contrato
    async eliminarRegistro(registroId, cancelarPlan = false) {
        const cliente = await conectar();
        const session = cliente.client.startSession();

        try {
            const db = cliente;
            const seguimientos = db.collection("seguimientos");
            const contratos = db.collection("contratos");

            await session.withTransaction(async () => {
                // Buscar seguimiento
                const seguimiento = await seguimientos.findOne(
                    { clienteId: this.clienteId, planId: this.planId },
                    { session }
                );
                if (!seguimiento) throw new Error("Seguimiento no encontrado");

                // Eliminar registro
                await seguimientos.updateOne(
                    { _id: seguimiento._id },
                    { $pull: { registros: { _id: new ObjectId(registroId) } } },
                    { session }
                );

                // si decide cancelar el plan, eliminar contrato + seguimiento
                if (cancelarPlan) {
                    await contratos.deleteOne(
                        { clienteId: this.clienteId, planId: this.planId },
                        { session }
                    );
                    await seguimientos.deleteOne({ _id: seguimiento._id }, { session });
                }
            });

            console.log("Registro eliminado correctamente.");
        } catch (error) {
            console.error("Error eliminando registro:", error);
        } finally {
            await session.endSession();
        }
    }
}

export default Seguimiento_fisico;
