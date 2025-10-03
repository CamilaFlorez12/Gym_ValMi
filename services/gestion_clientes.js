import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import inquirer from "inquirer";

export function gestionClientes(db) {
    const clientes = db.collection("clientes");
    const planes = db.collection("planEntrenamiento");
    const contratos = db.collection("contratos");
    const seguimientos = db.collection("seguimientos");

    return {

        async crearCliente(data) {
            if (!data.nombre || typeof data.nombre !== "string") {
                throw new Error("El nombre es obligatorio y debe ser un texto.");
            }
            
            const nuevo = { ...data, creadoEn: new Date(), contratos: [] };
            const { insertedId } = await clientes.insertOne(nuevo);
            return insertedId;
        },


        async listarClientes() {
            const lista = await clientes.find().toArray();
            if (!lista.length) {
                console.log(" No hay clientes registrados.");
            }
            return lista;
        },

        async actualizarCliente(id, update) {
            if (!ObjectId.isValid(id)) {
                throw new Error("El ID proporcionado no es válido.");
            }
            if (!update || Object.keys(update).length === 0) {
                throw new Error("Debe proporcionar al menos un campo para actualizar.");
            }
            await clientes.updateOne({ _id: new ObjectId(id) }, { $set: update });
            return true;
        },


        async eliminarCliente(id) {
            if (!ObjectId.isValid(id)) {
                throw new Error("El ID proporcionado no es válido.");
            }
            const contratosActivos = await contratos.findOne({
                clienteId: new ObjectId(id),
                estado: "activo"
            });

            if (contratosActivos) {
                throw new Error("No se puede eliminar un cliente con contratos activos.");
            }
            await clientes.deleteOne({ _id: new ObjectId(id) });
            return true;
        },


        async asignarPlan(client, plan, session) {
            if (!ObjectId.isValid(client)) {
                throw new Error("El ID del cliente no es válido.");
            }
            if (!ObjectId.isValid(plan)) {
                throw new Error("El ID del plan no es válido.");
            }
            const cliente = await clientes.findOne({ _id: new ObjectId(client) }, { session });
            const planDoc = await planes.findOne({ _id: new ObjectId(plan) }, { session });
            if (!cliente || !planDoc) throw new Error("Cliente o plan no existe");
            if (!planDoc.duracionSemanas || isNaN(planDoc.duracionSemanas)) {
                throw new Error("El plan no tiene una duración válida.");
            }

            const fechaInicio = new Date();
            const fechaFin = dayjs(fechaInicio).add(planDoc.duracionSemanas, "week").toDate();

            const precio = planDoc.duracionSemanas *25000;

            const contrato = {
                clienteId: cliente._id,
                planId: planDoc._id,
                condiciones: "Acceso estándar al plan",
                duracionSemanas: planDoc.duracionSemanas,
                precio: precio,
                fechaInicio,
                fechaFin,
                estado: "activo"
            };

            const { insertedId } = await contratos.insertOne(contrato, { session });
            await clientes.updateOne(
                { _id: cliente._id },
                { $push: { contratos: insertedId } },
                { session }
            );
            return insertedId;
        },


        async historialCliente(id) {
            const cliente = await clientes.find().toArray();
            if (!id.length) {
                console.log(" No existe este cliente");
            }
            return cliente;
        },

        // async cancelarPlan(contratoId, session) {
        //     const contrato = await contratos.findOne({ _id: new ObjectId(contratoId) }, { session });
        //     if (!contrato) throw new Error("Contrato no existe");

        //     await seguimientos.deleteMany({ contratoId: contrato._id }, { session });
        //     await contratos.deleteOne({ _id: contrato._id }, { session });
        //     await clientes.updateOne(
        //         { _id: contrato.clienteId },
        //         { $pull: { contratos: contrato._id } },
        //         { session }
        //     );
        //     return true;
        // },
    };
}
