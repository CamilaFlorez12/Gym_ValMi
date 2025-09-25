import { cliente, conectar } from "./persistenciaArchivos.js";
import { seguimiento } from "./seguimiento_fisico.js";


class PlanAlimentacion {
    #calorias
    constructor(clienteId, planId, alimento,descripcion, calorias, fecha) {
        this.clienteId = clienteId;
        this.planId = planId;
        this.descripcion = descripcion;
        this.alimento = alimento;
        this.#calorias = calorias;
        this.fecha = fecha;
    }

    get calorias() {
        return this.#calorias
    }

    async registrarAlimeto() {
        const db = await conectar();
        const coleccionSeguimientoNutricional = db.collection("seguimientoNutricional");

        const registro = [
            {
                cliente: this.clienteId,
                plan: this.planId,
                descripcion: this.descripcion,
                nombre: this.alimento,
                calorias: this.#calorias,
                fecha: this.fecha
            }
        ]

        await coleccionSeguimientoNutricional.insertMany(registro)
    }
//reporte semanal de aliemtos
    static async reporteSemanal(clienteId) {
        const db = await conectar();

        //calculo de la semana(7 dias)
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - 7);

        const reporte = await db.collection("seguimientoNutricional").aggregate([
            {
                $match: {
                    cliente: clienteId,
                    fecha: { $gte: inicioSemana }
                }
            },
            {
                $group: {
                    _id: "$cliente",
                    calorias: { $sum: "$calorias" },
                    alimentos: { $push: "$alimento" }
                }
            }
        ]).toArray();
        return reporte
    }
}

export{PlanAlimentacion}


