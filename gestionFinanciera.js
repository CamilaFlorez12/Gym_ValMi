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
        this.ingresos+=monto
    }

    async actualizarEgresos(monto){
        if(monto < 0){
            throw new Error("El egreso no puede ser negativo");
        }
        this.egresos+=monto
    }
}

class Mensualidades{
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

        const cliente = await coleccionContrato.find({cliente:this.nombreCliente}).toArray();

        coleccionContrato.aggregate([
            {$match:{nombre:cliente}},
            {$group:{
                _id:"$precio",
                total:{$sum:this.#precio}
            }}
        ])

    }
    }

