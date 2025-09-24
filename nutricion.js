import { conectar } from "./persistenciaArchivos.js";
import { seguimiento } from "./seguimiento.js";

class RegistroSemanal {
    #fecha;
    constructor(fecha, peso, porcentajeGrasa) {
        //validacion de peso
        if (peso <= 0) {
            throw new Error("El peso debe ser mayor a cero");
        }
        this.#fecha = fecha;
        this.peso = peso;
        this.porcentajeGrasa = porcentajeGrasa
    }
    //para poder acceder al metodo privado de fecha
    get fecha() {
        return this.#fecha
    }

    //funcion para guardar el proceso semanal
    async guardar(nombreCliente) {
        const db = await conectar();
        const coleccionSeguimiento = db.collection("seguimiento");

        const cliente = await coleccionSeguimiento.findOne({ nombre: nombreCliente });
        if (!cliente) {
            throw new Error("No existe cliente");
        }

        //guarda el proceso 
        const guardar = await coleccionSeguimiento.updateOne(
            { nombre: nombreCliente },
            {
            $push: {                            //se usa push porque su existencia depende de la clase seguimiento
                    registros: {
                        fecha: this.#fecha,
                        peso: this.peso,
                        porcentajeGrasa: this.porcentajeGrasa
                    }
                }
            }
        );
        console.log(`Registro agregado: ${resultado.modifiedCount}`);

    }
}

class PlanAlimentacion extends RegistroSemanal{
    constructor(clienteId,planId,descripcion,fecha,peso,porcentajeGrasa){
        super(fecha,peso,porcentajeGrasa);
        this.clienteId = clienteId;
        this.planId = planId;
        this.descripcion = descripcion;
    }
}