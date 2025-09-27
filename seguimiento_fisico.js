import { cliente, conectar } from "./persistenciaArchivos.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";


class Seguimiento_fisico {
    constructor(clienteId, planId) {
        if (!ObjectId.isValid(clienteId)) throw new Error("clienteId inválido");
        if (!ObjectId.isValid(planId)) throw new Error("planId inválido");

        this.clienteId = clienteId;
        this.planId = planId;
        this.registros = [];
    }

    async registrarAvance({ peso, grasa, medidas, fotos = [], comentario }) {
        if (typeof peso !== "number" || peso <= 20 || peso >= 300) {
            throw new Error("El peso debe ser un número válido en kg (20-300).");
        }
        if (typeof grasa !== "number" || grasa < 0 || grasa > 100) {
            throw new Error("La grasa debe ser un porcentaje válido (0-100).");
        }
        if (typeof medidas !== "object" || Array.isArray(medidas)) {
            throw new Error("Las medidas deben ser un objeto con valores numéricos.");
        }
        if (!Array.isArray(fotos)) {
            throw new Error("Las fotos deben ser un arreglo de URLs o rutas.");
        }
        if (comentario && typeof comentario !== "string") {
            throw new Error("El comentario debe ser texto.");
        }
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

        if (!seguimiento || !seguimiento.registros?.length) {
            console.log(" No hay registros de seguimiento para este cliente.");
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
                fotos:r.fotos.join(","),
                Comentario: r.comentario,
            }))
        );
        const inicial = registros[0];
        const ultimo = registros[registros.length - 1];
        console.log(`Cambio de peso: ${ultimo.peso - inicial.peso} kg`);
        console.log(`Cambio de grasa: ${ultimo.grasa - inicial.grasa}%`);
    }

    // Eliminar registro y opcionalmente cancelar plan y contrato
    async eliminarRegistro(registroId, cancelarPlan = false) {
         if (!ObjectId.isValid(registroId)) {
            throw new Error("registroId inválido");
        }
        const cliente = await conectar();
        const session = cliente.client.startSession();

        try {
            const db = cliente;
            const seguimientos = db.collection("seguimientos");
            const contratos = db.collection("contratos");
            const planes = db.collection("planEntrenamiento");

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
                    await planes.updateOne(
                        { _id: this.planId },
                        { $set: { estado: "cancelado" } },
                        { session }
                    );
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
