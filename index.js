import inquirer from 'inquirer';
import { conectar } from './persistenciaArchivos.js';
import { gestionClientes } from './gestion_clientes.js';
import { GestionFinanciero } from './gestionFinanciera.js';
import Contrato from './contratos.js';
import { PlanAlimentacion, PlanAlimentacion } from './nutricion.js';
import { CrearPlan } from './planEntrenamiento.js';
import PlanEntrenamiento from './planEntrenamiento.js';
import Seguimiento_fisico from './seguimiento_fisico.js';

async function menu() {
    try {
        const db = await conectar();

        const respuesta = await inquirer.prompt([{
            type: 'list',
            name: 'opcion',
            message: 'Bienvenido a nuestro Gym Valmi, selecciona una opcion:',
            choices: [
                { name: "1.Gestionar Clientes", value: "1" },
                { name: "2.Gestionar Planes De Entrnamiento", value: "2" },
                { name: "3.Seguimiento Físico", value: "3" },
                { name: "4.Crear Plan De Nutrición", value: "4" },
                { name: "5.Gestión Financiera", value: "5" }
            ]
        }])
        switch (respuesta.opcion) {
            case "1":
                await menuGestionClientes(db);
                break;
            case "2":
                await gestionPlanes();
                break;
            case "3":
                await seguimientoFisico();
        }
    } catch (error) {

    }

}

async function menuGestionClientes(db) {
    try {
        const gestionar = gestionClientes(db);
        const accion = await inquirer.prompt([{
            type: 'list',
            name: 'opcion',
            message: 'Ingresa lo que deseaa hacer:',
            choices: [
                { name: "1.Crear Cliente", value: "1" },
                { name: "Listar Clientes", value: "2" },
                { name: "3.Acualizar Cliente", value: "3" },
                { name: "4.Eliminar Cliente", value: "4" },
                { name: "5.Asignar Plan", value: "5" }
            ]
        }])
        switch (accion.opcion) {
            case "1":
                const datos = await inquirer.prompt([
                    { type: 'input', name: "nombre", message: "Ingrese el nombre del cliente:" },
                    { type: 'input', name: "correo", message: "Ingrese el correo del cliente:" },
                    { type: 'input', name: "documento", message: "Ingresa el número de documeto del cliente:" },
                    {
                        type: 'list', name: "planes", message: "Ingresa el plan asigando al cliente:",
                        choices: ["Plan Básico", "Plan Intermedio", "Plan Avanzado"]
                    }
                ]);
                const cliente = await gestionar.crearCliente(datos);
                console.log("cliente registrado exitosamenre", cliente);
                break;
            case "2":
                const listar = await gestionar.listarClientes();
                console.log(listar);
                break;
            case "3":
                const { id, correo } = await inquirer.prompt([
                    { type: 'input', name: "id", message: "Ingrese el ID del cliente a actualizar:" },
                    { type: 'input', name: "correo", message: "Ingrese el nuevo correo del cliente:" }
                ]);
                await gestionar.actualizarCliente(id, { correo });
                console.log("Cliente actualizado");
                break;
            case "4":
                const eliminar = await inquirer.prompt([
                    { type: 'input', name: "id", message: "Ingrese el ID del cliente a eliminar" }
                ]);
                await gestionar.eliminarCliente(eliminar.id);
                console.log("cliente eliminado");
                break;
            case "5":
                const { clienteId, planId } = await inquirer.prompt([
                    { type: 'input', name: "clienteId", message: "Para asignar un plan, ingrese el ID del cliente:" },
                    { type: 'input', name: "planId", message: "Ingrese el ID del plan:" }
                ]);
                await gestionar.asignarPlan(clienteId, planId);
                console.log("Plan asignado correctamente");
                break;
        }

    } catch (error) {
        console.log("Error al gestionar clientes", error);
    }

}

async function gestionPlanes() {
    try {
        const gestionPlan = CrearPlan;
        const accion = await inquirer.prompt([{
            type: 'list',
            name: 'opcion',
            message: 'Ingresa y elije lo de desea hacer:',
            choices: [
                { name: "1.Mostrar Planes", value: "1" },
                { name: "2.Renovar Plan", value: "2" },
                { name: "3.Cancelar Plan", value: "3" },
                { name: "4.Finalizar Plan", value: "4" },
                { name: "5.Salir", value: "5" }
            ]
        }])
        switch (accion.opcion) {
            case "1":
                const db = await conectar();
                const planes = await db.collection("planEntrenamiento").find().toArray();
                console.log("Planes disponibles:", planes);
                break;
            case "2":
                const { planEntrenamientoId } = await inquirer.prompt([
                    { type: 'input', name: 'planEntrenamientoId', message: "Ingrese el ID del plan a renovar:" }
                ]);
                await PlanEntrenamiento.renovarPlan(planEntrenamientoId);
                break;
            case "3":
                const { planId, clienteId } = await inquirer.prompt([
                    { type: 'input', name: 'planId', message: 'Ingrese el ID del plan a cancelar' },
                    { type: 'input', name: 'clienteId', message: 'Ingrese el ID de cliente al que le va a cancelar el plan:' }
                ]);
                await PlanEntrenamiento.cancelarPlan(planId, clienteId)
                break;
            case "4":
                const { entrenamientoId } = await inquirer.prompt([
                    { type: 'input', name: 'entrenamientoId', message: 'Ingrese el ID del entrenamiento que quiere finalizar:' }
                ]);
                await PlanEntrenamiento.finalizarPlan(entrenamientoId);
                break;
            case "5":
                console.log("Saliendo...");
                break;
        }
    } catch (error) {
        console.log("Error al gestionar planes", error);
    }
}

async function seguimientoFisico() {
    try {
        const { clienteId, planId } = await inquirer.prompt([
            { type: 'input', name: 'clienteId', message: 'Ingrese el ID del cliente:' },
            { type: 'input', name: 'planId', message: 'Ingrese el ID del plan:' }
        ]);

        const seguimientoFisico = new Seguimiento_fisico(clienteId, planId);
        const accion = await inquirer.prompt([{
            type: 'list',
            name: 'opcion',
            message: 'Ingresa lo que deseas hacer:',
            choices: [
                { name: "1.Registrar avance", value: "1" },
                { nombre: "2.Ver progreso", value: "2" },
                { nombre: "3.Eliminar registro", value: "3" }
            ]
        }])

        switch (accion.opcion) {
            case "1":
                const registro = await inquirer.prompt([
                    { type: 'input', name: 'peso', message: 'Ingrese el peso:' },
                    { type: 'input', name: 'grasa', message: 'Ingrese la grasa:' },
                    { type: 'input', name: 'medidas', message: 'Ingrese las medidas:' },
                    { type: 'input', name: 'fotos', message: 'Inserte fotos:' },
                    { type: 'input', name: 'comentario', message: 'Ingrese un comentario:' }
                ]);
                await seguimientoFisico.registrarAvance(registro);
                console.log("Seguimiento físico registrado exitosamente", seguimientoFisico);
                break;
            case "2":
                await seguimientoFisico.verProgreso();
                break;
            case "3":
                const { registroId, cancelarPlan } = await inquirer.prompt([
                    { type: 'input', name: 'registroId', message: 'Ingrese el ID del registro que desea eliminar:' },
                    { type: 'confirm', name: 'cancelar', message: '¿Desea cancelar también el plan y contrato?' }

                ]);
                await seguimientoFisico.eliminarRegistro(registroId,cancelarPlan);
                break
            }
    } catch (error) {
        console.log("Error en menú de seguimiento físico",error);
    }
}

async function planNuticion() {
    try {
        const PlanAlimentacion = PlanAlimentacion;
    } catch (error) {
        
    }
}
