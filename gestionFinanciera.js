import { cliente, conectar } from "./persistenciaArchivos.js";
import { ObjectId } from "mongodb";

//clase abstracta de gestionfinanciera
class GestionFinanciero {
    #ingresos
    #egresos
    constructor(ingresos = 0, egresos = 0) {
        if (isNaN(ingresos) || ingresos < 0) throw new Error("Ingresos inválidos");
        if (isNaN(egresos) || egresos < 0) throw new Error("Egresos inválidos");
        this.#ingresos = ingresos;
        this.#egresos = egresos;
    }

    get ingresos() {
        return this.#ingresos
    }

    get egresos() {
        return this.#egresos
    }

    async obtenerIngresos() {
        throw new Error("El metodo debe ser implementado por las clases hijas")
    }

    async obtenerEgresos() {
        throw new Error("El metodo debe ser implementado por las clases hijas")
    }
    //no perimte que sea negativo
    async actualizarIngresos(monto) {
        if (typeof monto !== "number" || isNaN(monto) || monto < 0) {
            throw new Error("El ingreso debe ser un número válido y positivo");
        }

        const session = cliente.startSession();
        try {
            await session.withTransaction(async () => {
                const db = await conectar();
                const finanzas = db.collection("finanzas");

                this.#ingresos += monto

                await finanzas.insertOne({
                    tipo: "ingreso",
                    monto,
                    fecha: new Date()
                }, { session });
            });
            console.log("Ingreso registrado")
        } catch (error) {
            console.log("Error al insertar ingreso", error);
        } finally {
            await session.endSession();
        }
    }


    async actualizarEgresos(monto) {
        if (typeof monto !== "number" || isNaN(monto) || monto < 0) {
            throw new Error("El egreso no puede ser negativo");
        }
        const session = cliente.startSession();
        try {
            await session.withTransaction(async () => {
                const db = await conectar();
                const finanzas = db.collection("finanzas");

                this.#egresos += monto

                await finanzas.insertOne({
                    tipo: "egreso",
                    monto,
                    fecha: new Date()
                }, { session });
            });
            console.log("Egreso registrado")
        } catch (error) {
            console.log("Error al insertar egreso", error);
        } finally {
            await session.endSession();
        }
    }
}
//INGRESOS

//subclase mensualidades
class Mensualidades extends GestionFinanciero {
    #clienteId
    #plan
    #precio
    constructor(clienteId, plan, precio) {
        super(0, 0);
        if (!ObjectId.isValid(clienteId)) throw new Error("clienteId inválido");
        if (!plan) throw new Error("El plan es obligatorio");
        if (typeof precio !== "number" || precio <= 0) throw new Error("El precio debe ser mayor a 0");
        this.#clienteId = clienteId;
        this.#plan = plan;
        this.#precio = precio;
    }

    get clienteId() {
        return this.#clienteId
    }

    get plan() {
        return this.#plan
    }

    get precio() {
        return this.#precio
    }

    async obtenerIngresos() {
        const db = await conectar();
        const coleccionContrato = db.collection("contratos");

        const ingresos = await coleccionContrato.aggregate([
            { $match: { cliente: new ObjectId(this.#clienteId) } },
            {
                $group: {
                    _id: "$cliente",
                    total: { $sum: "$precio" }
                }
            }
        ]).toArray();

        return ingresos

    }
}

//EGRESOS

//subclase servicios
class Servicios extends GestionFinanciero {
    #pagoEntrenadores
    #servicios
    #mantenimientoMaquinas
    #suplementos
    constructor(pagoEntrenadores, servicios, mantenimientoMaquinas, suplementos) {
        super(0, 0);
        for (const val of [pagoEntrenadores, servicios, mantenimientoMaquinas, suplementos]) {
            if (typeof val !== "number" || isNaN(val) || val < 0) {
                throw new Error("Todos los gastos deben ser números válidos y positivos");
            }
        }
        this.#pagoEntrenadores = pagoEntrenadores;
        this.#servicios = servicios;
        this.#mantenimientoMaquinas = mantenimientoMaquinas;
        this.#suplementos = suplementos;
    }

    get pagoEntrenadores() {
        return this.#pagoEntrenadores
    }

    get servicios() {
        return this.#servicios
    }

    get mantenimientoMaquinas() {
        return this.#mantenimientoMaquinas
    }

    get suplementos() {
        return this.#suplementos
    }

    async registrarEgresos() {
        const session = cliente.startSession();
        try {
            await session.withTransaction(async () => {
                const db = await conectar();
                const coleccionGastos = db.collection("gastos");
                const gastos = [
                    { tipo: "pagoEntrenadores", monto: this.#pagoEntrenadores, fecha: new Date() },
                    { tipo: "servicios", monto: this.#servicios, fecha: new Date() },
                    { tipo: "mantenimientoMaquinas", monto: this.#mantenimientoMaquinas, fecha: new Date() },
                    { tipo: "suplementos", monto: this.#suplementos, fecha: new Date() }
                ];

                for (const gasto of gastos) {
                    if (gasto.monto < 0) {
                        throw new Error("EL monto no puede ser negativo")
                    }
                }
                    await coleccionGastos.insertMany(gastos,{session})
                    console.log("gastos registrados exitosamnte");
                    const egresos = await coleccionGastos.aggregate([
                        {
                            $group: {
                                _id: "$tipo",
                                total: { $sum: "$monto" }
                            }
                        }
                    ]).toArray();
                    return egresos;
                }
            )
        } catch (error) {
            console.log("Error al registrar egresos", error);
        } finally {
            await session.endSession();
        }
    }
}

//consulta balance financiero por fecha

export async function balanceFinanciero() {
    try {
        const db = await conectar();
        const balance = db.collection("finanzas");

        const resultados = await balance.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
                    total: { $sum: "$monto" }
                }
            }, {
                $sort: { total: -1 }
            }
        ]).toArray();
        if (!resultados.length) {
            console.log("No hay registros financieros");
            return;
        }
        console.log("total ingresos por fecha ->");
        resultados.forEach(t => {
            console.log(`Fecha: ${t._id} | Total:${t.total}`)
        })
    } catch (error) {
        console.log("Error al consultar", error)
    }
}

export{GestionFinanciero,Mensualidades,Servicios}