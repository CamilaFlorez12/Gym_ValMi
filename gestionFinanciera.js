import { conectar } from "./persistenciaArchivos.js";

class GestionFinanciero{
    #ingresos
    #egresos
    constructor(ingresos,egresos){
        this.#ingresos=ingresos;
        this.#egresos=egresos;
    }

    get ingresos(){
        return this.#ingresos
    }

    get egresos(){
        return this.#egresos
    }

    async obtenerIngresos(){
        throw new Error("El metodo debe ser implementado por las clases hijas")
    }

    async obtenerEgresos(){
        throw new Error("El metodo debe ser implementado por las clases hijas")
    }

    async actualizarIngresos(monto){
        if(monto < 0){
            throw new Error("El ingreso no puede ser negativo");
        }
        this.#ingresos+=monto

        const db = conectar();
        await db.collection("finanzas".insertOne({
            tipo:"ingreso",
            monto,
            fecha:new Date()
        }))
    }

    async actualizarEgresos(monto){
        if(monto < 0){
            throw new Error("El egreso no puede ser negativo");
        }
        this.#egresos+=monto

        const db = conectar();
        await db.collection("finanzas".insertOne({
            tipo:"egreso",
            monto,
            fecha:new Date()
        }))
    }
}

class Mensualidades extends GestionFinanciero{
    #nombreCliente
    #plan
    #precio
    constructor(nombreCliente,plan,precio){
        this.#nombreCliente = nombreCliente;
        this.#plan = plan;
        this.#precio = precio;
    }

    get nombreCliente(){
        return this.#nombreCliente
    }

    get plan(){
        return this.#plan
    }

    get precio(){
        return this.#precio
    }

    async obtenerIngresos(){
        const db = await conectar();
        const coleccionContrato = db.collection("contratos");

        const ingresos = await coleccionContrato.aggregate([
            {$match:{cliente:this.#nombreCliente}},
            {$group:{
                _id:"$cliente",
                total:{$sum:"$precio"}
            }}
        ]).toArray();

        return ingresos

    }
}