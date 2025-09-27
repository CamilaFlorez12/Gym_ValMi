import inquirer from 'inquirer';
import { conectar } from './persistenciaArchivos.js';
import { gestionClientes } from './gestion_clientes.js';
import { GestionFinanciero, Mensualidades, Servicios, balanceFinanciero } from './gestionFinanciera.js';
import Contrato from './contratos.js';
import { PlanAlimentacion } from './nutricion.js';
import { CrearPlan } from './planEntrenamiento.js';
import PlanEntrenamiento from './planEntrenamiento.js';
import Seguimiento_fisico from './seguimiento_fisico.js';


async function menuGestionClientes(db) {
    let salir = false;
    while (!salir) {
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
                    { name: "5.Asignar Plan", value: "5" },
                    { name: "6.Salir", value: "6" }
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
                case "6":
                    console.log("Saliendo...");
                    salir = true;
                    break;
            }

        } catch (error) {
            console.log("Error al gestionar clientes", error);
        }
    }


}

async function gestionPlanes() {
    let salir = false;
    while (!salir) {
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
                    const { nuevasSemanas } = await inquirer.prompt([
                        { type: 'number', name: 'nuevasSemanas', message: "Ingrese la nueva duración en semanas:" }
                    ]);
                    await PlanEntrenamiento.renovarPlan(planEntrenamientoId, nuevasSemanas);
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
                    salir = true
                    break;
            }
        } catch (error) {
            console.log("Error al gestionar planes", error);
        }
    }

}

async function seguimientoFisico() {
    let salir = false;
    while (!salir) {
        try {
            const { clienteId, planId } = await inquirer.prompt([
                { type: 'input', name: 'clienteId', message: 'Ingrese el ID del cliente:' },
                { type: 'input', name: 'planId', message: 'Ingrese el ID del plan:' }
            ]);

            const seguimientoFisico = new Seguimiento_fisico(clienteId, planId);
            const { opcion } = await inquirer.prompt([{
                type: 'list',
                name: 'opcion',
                message: 'Ingresa lo que deseas hacer:',
                choices: [
                    { name: "1.Registrar avance", value: "1" },
                    { nombre: "2.Ver progreso", value: "2" },
                    { nombre: "3.Eliminar registro", value: "3" },
                    { nombre: "4.Salir", value: "4" }
                ]
            }])

            switch (opcion) {
                case "1":
                    const registro = await inquirer.prompt([
                        { type: 'input', name: 'peso', message: 'Ingrese el peso:' },
                        { type: 'input', name: 'grasa', message: 'Ingrese la grasa:' },
                        { type: 'input', name: 'medidas', message: 'Ingrese las medidas:' },
                        { type: 'input', name: 'fotos', message: 'Inserte fotos:' },
                        { type: 'input', name: 'comentario', message: 'Ingrese un comentario:' }
                    ]);

                    registro.peso = parseFloat(registro.peso);
                    registro.grasa = parseFloat(registro.grasa);
                    registro.fotos = registro.fotos.split(',').map(f => f.trim());

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
                    await seguimientoFisico.eliminarRegistro(registroId, cancelarPlan);
                    break;
                case "4":
                    console.log("Saliendo...");
                    salir = true;
                    break;

            }
        } catch (error) {
            console.log("Error en menú de seguimiento físico", error);
        }
    }


}

async function planNutricion() {
    let salir = false;
    while (!salir) {
        try {
            const accion = await inquirer.prompt([{
                type: 'list',
                name: 'opcion',
                message: 'Ingrese y elije lo que quieres hacer:',
                choices: [
                    { name: "1.Registrar alimento", value: "1" },
                    { name: "2.Generar reporte semanal", value: "2" },
                    { name: "3.Salir", value: "3" }
                ]
            }])
            switch (accion.opcion) {
                case "1":
                    const registro = await inquirer.prompt([
                        { type: 'input', name: 'clienteId', message: 'Ingrese el ID del cliente:' },
                        { type: 'input', name: 'planId', message: 'Ingrese el ID del plan:' },
                        { type: 'input', name: 'descripcion', message: 'Ingrese la descripcion del plan:' },
                        { type: 'input', name: 'nombre', message: 'Ingrese el nombre del alimeto:' },
                        { type: 'input', name: 'calorias', message: 'Ingrese la calorias del alimento:' },
                        { type: 'input', name: 'fecha', message: 'Ingrese la fecha:' }
                    ])
                    //convierte a formato fecha
                    const fecha = new Date(registro.fecha);
                    const alimento = new PlanAlimentacion(
                        registro.clienteId,
                        registro.planId,
                        registro.descripcion,
                        registro.nombre,
                        registro.calorias,
                        registro.fecha
                    );
                    await alimento.registrarAlimeto();
                    console.log("Alimento registrado exitosamente");
                    break;
                case "2":
                    const { clienteId } = await inquirer.prompt([
                        { type: 'input', name: 'clienteId', message: 'Ingrese el ID del cliente para generar el reporte:' }
                    ]);

                    const reporte = await PlanAlimentacion.reporteSemanal(clienteId);

                    if (reporte.length === 0) {
                        console.log("No hay registros de alimentos en la última semana.");
                    } else {
                        console.log("Reporte semanal:");
                        console.log("Total calorías:", reporte[0].calorias);
                        console.log("Alimentos:", reporte[0].alimentos);
                    }
                    break;
                case "3":
                    console.log("Saliendo...");
                    salir = true;
                    break;

            }
        } catch (error) {
            console.log("Error con el menu plan nutricion", error);
        }
    }

}

async function gestionFinanciera() {
    let salir = false;
    while (!salir) {
        try {
            const { opcion } = await inquirer.prompt([{
                type: 'list',
                name: 'opcion',
                message: 'Ingresa la opcion que desea:',
                choices: [
                    { name: '1.Registrar ingresos (Mensualidades)', value: "1" },
                    { name: '2.Registrar egresos', value: '2' },
                    { name: '3.Consultar valance financiero', value: '3' },
                    { name: '4.Salir', value: '4' }
                ]
            }]);
            switch (opcion) {
                case "1":
                    const { clienteId, plan, precio } = await inquirer.prompt([
                        { type: "input", name: "clienteId", message: "Ingrese ID del cliente:" },
                        { type: "input", name: "plan", message: "Ingrese nombre del plan:" },
                        { type: "number", name: "precio", message: "Ingrese el precio de la mensualidad:" }
                    ]);
                    const mensualidad = new Mensualidades(clienteId, plan, precio);
                    await mensualidad.actualizarIngresos(precio);
                    console.log('Mensualidad registrada');
                    break;
                case "2":
                    const { pagoEntrenadores, servicios, mantenimiento, suplementos } = await inquirer.prompt([
                        { type: "number", name: "pagoEntrenadores", message: "Monto pago entrenadores:" },
                        { type: "number", name: "servicios", message: "Monto servicios:" },
                        { type: "number", name: "mantenimiento", message: "Monto mantenimiento de máquinas:" },
                        { type: "number", name: "suplementos", message: "Monto suplementos:" }
                    ]);

                    const egresos = new Servicios(pagoEntrenadores, servicios, mantenimiento, suplementos);
                    await egresos.registrarEgresos();
                    break;
                case "3":
                    await balanceFinanciero();
                    break;
                case "4":
                    console.log("Saliendo...");
                    salir = true;
                    break;
            }


        } catch (error) {
            console.log("Error en el menu gestion financiera")
        }
    }

}

async function menu() {
    let salir = false;
    while (!salir) {
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
                    { name: "5.Gestión Financiera", value: "5" },
                    { name: "6.Salir", value: "6" }
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
                case "4":
                    await planNutricion();
                    break;
                case "5":
                    await gestionFinanciera();
                    break;
                case "6":
                    console.log("Saliendo...");
                    salir = true;
                    break;
            }
        } catch (error) {
            console.log("Error al ejecutar el menu principal")
        }
    }
}

menu();