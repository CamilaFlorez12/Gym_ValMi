import { conectar } from "./persistenciaArchivos.js";
import Seguimiento_fisico from "./seguimiento_fisico.js";
import { ObjectId } from "mongodb";



class PlanAlimentacion {
    #calorias
    constructor(clienteId, planId, alimento, descripcion, calorias, fecha) {
        if (!ObjectId.isValid(clienteId)) throw new Error("clienteId inválido");
        if (!ObjectId.isValid(planId)) throw new Error("planId inválido");
        if (!alimento || typeof alimento !== "string") throw new Error("El alimento debe ser un texto válido");
        if (descripcion && typeof descripcion !== "string") throw new Error("La descripción debe ser texto");

        calorias = Number(calorias);
        if (isNaN(calorias) || calorias <= 0) throw new Error("Las calorías deben ser un número positivo");

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
        const {db} = await conectar(); 
        const coleccionSeguimientoNutricional = db.collection("seguimientoNutricional");

        
        const fechaObj = new Date(this.fecha);
        if (isNaN(fechaObj.getTime())) {
            throw new Error("Fecha inválida");
        }

        const registro = [
            {
                cliente: new ObjectId(this.clienteId),
                plan: new ObjectId(this.planId),
                descripcion: this.descripcion,
                alimento: this.alimento,
                calorias: this.#calorias,
                fecha: fechaObj
            }
        ];

        await coleccionSeguimientoNutricional.insertMany(registro);
        console.log("Alimento registrado correctamente");

    }
    //reporte semanal de aliemtos
    static async reporteSemanal(clienteId) {
        if (!ObjectId.isValid(clienteId)) {
            throw new Error("clienteId inválido");
        }
        const {db} = await conectar();
        const coleccionSeguimientoNutricional = db.collection("seguimientoNutricional");

        //calculo de la semana(7 dias)
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - 7);

        const reporte = await db.collection("seguimientoNutricional").aggregate([
            {
                $match: {
                    cliente: new ObjectId(clienteId),
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

        if (!reporte.length) {
            console.log("No hay registros en la última semana");
            return [];
        }

        return reporte
    }
}

export { PlanAlimentacion }


