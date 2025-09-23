import { ObjectId } from "mongodb";
import dayjs from "dayjs";

export function gestionClientes(db) {
    const clientes = db.collection("clientes");
    const planes = db.collection("planes");
    const contratos = db.collection("contratos");
    const seguimientos = db.collection("seguimientos");

    return {

        async crearCliente(data) {
            const nuevo = { ...data, creadoEn: new Date(), contratos: [] };
            const { insertedId } = await clientes.insertOne(nuevo);
            return insertedId;
        },


        async listarClientes() {
            return clientes.find().toArray();
        },

        async actualizarCliente(id, update) {
            await clientes.updateOne({ _id: new ObjectId(id) }, { $set: update });
            return true;
        },


        async eliminarCliente(id) {
            await clientes.deleteOne({ _id: new ObjectId(id) });
            return true;
        },


        async asignarPlan(client, plan, session) {
            const cliente = await clientes.findOne({ _id: new ObjectId(client) }, { session });
            const planDoc = await planes.findOne({ _id: new ObjectId(plan) }, { session });
            if (!cliente || !planDoc) throw new Error("Cliente o plan no existe");

            const fechaInicio = new Date();
            const fechaFin = dayjs(fechaInicio).add(planDoc.duracionSemanas, "week").toDate();

            const contrato = {
                clienteId: cliente._id,
                planId: planDoc._id,
                fechaInicio,
                fechaFin
            };

            const { insertedId } = await contratos.insertOne(contrato, { session });
            await clientes.updateOne(
                { _id: cliente._id },
                { $push: { contratos: insertedId } },
                { session }
            );
            return insertedId;
        },


        async cancelarPlan(contratoId, session) {
            const contrato = await contratos.findOne({ _id: new ObjectId(contratoId) }, { session });
            if (!contrato) throw new Error("Contrato no existe");

            await seguimientos.deleteMany({ contratoId: contrato._id }, { session });
            await contratos.deleteOne({ _id: contrato._id }, { session });
            await clientes.updateOne(
                { _id: contrato.clienteId },
                { $pull: { contratos: contrato._id } },
                { session }
            );
            return true;
        },
    };
}
