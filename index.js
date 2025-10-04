import inquirer from 'inquirer';
import { conectar } from './utils/persistenciaArchivos.js';
import { gestionClientes } from './services/gestion_clientes.js';
import { GestionFinanciero, Mensualidades, Servicios, balanceFinanciero } from './services/gestionFinanciera.js';
import Contrato from './services/contratos.js';
import { PlanAlimentacion } from './services/nutricion.js';
import { CrearPlan } from './services/planEntrenamiento.js';
import PlanEntrenamiento from './services/planEntrenamiento.js';
import Seguimiento_fisico from './services/seguimiento_fisico.js';
import chalk from 'chalk';
import { LeerInfoClientes } from './services/historialProgreso.js';
import { escribirArchivo } from './services/historialProgreso.js';



async function menuGestionClientes(db) {
    let salir = false;
    while (!salir) {
        try {
            const gestionar = gestionClientes(db);
            const accion = await inquirer.prompt([{
                type: 'list',
                name: 'opcion',
                message: chalk.hex('#D8BFD8')('Ingresa lo que deseas hacer:'),
                choices: [
                    { name: chalk.hex('#FFB6C1')("1. Crear Cliente"), value: "1" },
                    { name: chalk.hex('#FFB6C1')("2. Listar Clientes"), value: "2" },
                    { name: chalk.hex('#FFB6C1')("3. Actualizar Cliente"), value: "3" },
                    { name: chalk.hex('#FFB6C1')("4. Eliminar Cliente"), value: "4" },
                    { name: chalk.hex('#FFB6C1')("5. Asignar Plan"), value: "5" },
                    { name: chalk.hex('#FFB6C1')("6. Salir"), value: "6" }
                ]
            }])
            switch (accion.opcion) {
                case "1":
                    const datos = await inquirer.prompt([
                        { type: 'input', name: "nombre", message: chalk.hex('#FFB6C1')("Ingrese el nombre del cliente:") },
                        { type: 'input', name: "correo", message: chalk.hex('#FFB6C1')("Ingrese el correo del cliente:") },
                        { type: 'input', name: "documento", message: chalk.hex('#FFB6C1')("Ingrese el número de documento del cliente:") },
                        {
                            type: 'list', name: "planes", message: chalk.hex('#FFB6C1')("Selecciona el plan asignado al cliente:"),
                            choices: [
                                chalk.hex('#FFB6C1')("Plan Básico"),
                                chalk.hex('#FFB6C1')("Plan Intermedio"),
                                chalk.hex('#FFB6C1')("Plan Avanzado")
                            ]
                        }
                    ]);
                    const cliente = await gestionar.crearCliente(datos);
                    console.log(chalk.hex('#FFB6C1')('Cliente registrado exitosamente!', cliente));;
                    break;
                case "2":
                    const listar = await gestionar.listarClientes();
                    console.log(chalk.hex('#D8BFD8')(' Lista de clientes:'));
                    listar.forEach((cliente, index) => {
                        console.log(
                            chalk.hex('#FFB6C1')(`${index + 1}. Nombre: ${cliente.nombre} | correo: ${cliente.correo}| documento: ${cliente.documento}`)
                        );
                    });
                    break;
                case "3":
                    const { id, correo } = await inquirer.prompt([
                        { type: 'input', name: "id", message: "Ingrese el ID del cliente a actualizar:" },
                        { type: 'input', name: "correo", message: "Ingrese el nuevo correo del cliente:" }
                    ]);
                    await gestionar.actualizarCliente(id, { correo });
                    console.log(chalk.hex('#FF69B4').bold(' Cliente actualizado'));
                    break;
                case "4":
                    const eliminar = await inquirer.prompt([
                        { type: 'input', name: "id", message: "Ingrese el ID del cliente a eliminar" }
                    ]);
                    await gestionar.eliminarCliente(eliminar.id);
                    console.log(chalk.hex('#FF69B4')(' Cliente eliminado exitosamente'));
                    break;
                case "5":
                    const { clienteId, planId } = await inquirer.prompt([
                        { type: 'input', name: "clienteId", message: "Para asignar un plan, ingrese el ID del cliente:" },
                        { type: 'input', name: "planId", message: "Ingrese el ID del plan:" }
                    ]);
                    await gestionar.asignarPlan(clienteId, planId);
                    console.log(chalk.hex('#D8BFD8')('Plan asignado correctamente'));
                    break;
                case "6":
                    console.log(chalk.hex('#BA55D3')('Saliendo... ¡Hasta pronto!'));
                    salir = true;
                    break;
            }

        } catch (error) {
            console.log(chalk.hex('#FF69B4')(' Error al gestionar clientes:'), error);
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
                message: chalk.hex('#D8BFD8')('Ingresa y elige lo que deseas hacer:'),
                choices: [
                    { name: chalk.hex('#FFB6C1')("1. Crear planes"), value: "1" },
                    { name: chalk.hex('#FFB6C1')("2. Mostrar Planes"), value: "2" },
                    { name: chalk.hex('#FFB6C1')("3. Renovar Plan"), value: "3" },
                    { name: chalk.hex('#FFB6C1')("4. Cancelar Plan"), value: "4" },
                    { name: chalk.hex('#FFB6C1')("5. Finalizar Plan"), value: "5" },
                    { name: chalk.hex('#FFB6C1')("6. Salir"), value: "6" }
                ]
            }])
            switch (accion.opcion) {
                case "1":
                    const { tipo, clienteId: clienteIdNuevo } = await inquirer.prompt([
                        { type: 'list', name: 'tipo', message: "Elige tipo de plan:", choices: ["basico", "intermedio", "avanzado"] },
                        { type: 'input', name: 'clienteId', message: "Ingresa el ID del cliente:" }
                    ]);
                    const nuevoPlan = gestionPlan.CrearPlan(tipo, clienteIdNuevo);
                    console.log("Plan creado exitosamente");
                    break;

                case "2":
                    const { db } = await conectar();
                    const planes = await db.collection("planEntrenamiento").find().toArray();
                    console.log(chalk.hex('#D8BFD8')(' Planes disponibles:'));
                    planes.forEach((plan, index) => {
                        console.log(
                            chalk.hex('#FFB6C1')(`${index + 1}. Nombre: ${plan.nombre}  | nivel: ${plan.nivel}`)
                        );
                    });
                    break;
                case "3":
                    const { planEntrenamientoId } = await inquirer.prompt([
                        { type: 'input', name: 'planEntrenamientoId', message: chalk.hex('#FFB6C1')("Ingrese el ID del plan a renovar:") }
                    ]);
                    const { nuevasSemanas } = await inquirer.prompt([
                        { type: 'number', name: 'nuevasSemanas', message: chalk.hex('#FFB6C1')("Ingrese la nueva duración en semanas:") }
                    ]);
                    await PlanEntrenamiento.renovarPlan(planEntrenamientoId, nuevasSemanas);
                    console.log(chalk.hex('#FF69B4').bold(`Plan renovado por ${nuevasSemanas} semanas`));
                    break;
                case "4":
                    const { planId, clienteId } = await inquirer.prompt([
                        { type: 'input', name: 'planId', message: chalk.hex('#FFB6C1')('Ingrese el ID del plan a cancelar:') },
                        { type: 'input', name: 'clienteId', message: chalk.hex('#FFB6C1')('Ingrese el ID del cliente al que le va a cancelar el plan:') }
                    ]);
                    await PlanEntrenamiento.cancelarPlan(planId, clienteId);
                    console.log(chalk.hex('#FF69B4')('Plan cancelado correctamente'));
                    break;
                case "5":
                    const { entrenamientoId } = await inquirer.prompt([
                        { type: 'input', name: 'entrenamientoId', message: chalk.hex('#FFB6C1')('Ingrese el ID del entrenamiento que quiere finalizar:') }
                    ]);
                    await PlanEntrenamiento.finalizarPlan(entrenamientoId);
                    console.log(chalk.hex('#FFDAB9')('Plan finalizado con éxito'));
                    break;
                case "6":
                    console.log(chalk.hex('#BA55D3')('Saliendo... ¡Hasta pronto!'));
                    salir = true
                    break;
            }
        } catch (error) {
            console.log(chalk.hex('#FF69B4')('Error al gestionar planes:'), error);
        }
    }

}

async function seguimientoFisico() {
    let salir = false;
    let seguimientoF = null;
    const ids = await inquirer.prompt([
        { type: 'input', name: 'clienteId', message: 'Ingrese el ID del cliente:' },
        { type: 'input', name: 'planId', message: 'Ingrese el ID del plan:' }
    ]);
    seguimientoF = new Seguimiento_fisico(ids.clienteId, ids.planId);
    while (!salir) {
        try {
            const { opcion } = await inquirer.prompt([{
                type: 'list',
                name: 'opcion',
                message: chalk.hex('#D8BFD8')(' Ingresa lo que deseas hacer:'),
                choices: [
                    { name: chalk.hex('#FFB6C1')("1. Registrar avance"), value: "1" },
                    { name: chalk.hex('#FFB6C1')("2. Ver progreso"), value: "2" },
                    { name: chalk.hex('#FFB6C1')("3. Eliminar registro"), value: "3" },
                    { name: chalk.hex('#FFB6C1')("4. Salir"), value: "4" }
                ]
            }])

            switch (opcion) {
                case "1":
                    const registro = await inquirer.prompt([
                        { type: 'input', name: 'peso', message: chalk.hex('#FFB6C1')('Ingrese el peso:') },
                        { type: 'input', name: 'grasa', message: chalk.hex('#FFB6C1')('Ingrese la grasa:') },
                        { type: 'input', name: 'medidas', message: chalk.hex('#FFB6C1')(' Ingrese las medidas:') },
                        { type: 'input', name: 'fotos', message: chalk.hex('#FFB6C1')(' Inserte fotos (separadas por coma):') },
                        { type: 'input', name: 'comentario', message: chalk.hex('#FFB6C1')('Ingrese un comentario:') }
                    ]);

                    registro.peso = parseFloat(registro.peso);
                    registro.grasa = parseFloat(registro.grasa);
                    registro.fotos = registro.fotos.split(',').map(f => f.trim());

                    await seguimientoF.registrarAvance(registro);
                    console.log(chalk.hex('#FFB6C1')('Seguimiento físico registrado exitosamente'));
                    break;
                case "2":
                    console.log(chalk.hex('#D8BFD8')('Visualizando progreso...'));
                    await seguimientoF.verProgreso();
                    break;
                case "3":
                    const { registroId, cancelarPlan } = await inquirer.prompt([
                        { type: 'input', name: 'registroId', message: chalk.hex('#FFB6C1')(' Ingrese el ID del registro que desea eliminar:') },
                        { type: 'confirm', name: 'cancelar', message: chalk.hex('#FFB6C1')(' ¿Desea cancelar también el plan y contrato?') }

                    ]);
                    await seguimientoF.eliminarRegistro(registroId, cancelarPlan);
                    console.log(chalk.hex('#FF69B4')('Registro eliminado correctamente'));
                    break;
                case "4":
                    console.log(chalk.hex('#BA55D3')('Saliendo... ¡Hasta pronto!'));
                    salir = true;
                    break;

            }
        } catch (error) {
            console.log(chalk.hex('#FF69B4')(' Error al gestionar seguimiento físico:'), error);
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
                message: chalk.hex('#D8BFD8')(' Ingresa lo que quieres hacer:'),
                choices: [
                    { name: chalk.hex('#FFB6C1')("1. Registrar alimento"), value: "1" },
                    { name: chalk.hex('#FFB6C1')("2. Generar reporte semanal"), value: "2" },
                    { name: chalk.hex('#FFB6C1')("3. Salir"), value: "3" }
                ]
            }])
            switch (accion.opcion) {
                case "1":
                    const registro = await inquirer.prompt([
                        { type: 'input', name: 'clienteId', message: chalk.hex('#FFB6C1')('Ingrese el ID del cliente:') },
                        { type: 'input', name: 'planId', message: chalk.hex('#FFB6C1')('Ingrese el ID del plan:') },
                        { type: 'input', name: 'descripcion', message: chalk.hex('#FFB6C1')('Ingrese la descripción del plan:') },
                        { type: 'input', name: 'nombre', message: chalk.hex('#FFB6C1')(' Ingrese el nombre del alimento:') },
                        { type: 'input', name: 'calorias', message: chalk.hex('#FFB6C1')('Ingrese las calorías del alimento:') },
                        { type: 'input', name: 'fecha', message: chalk.hex('#FFB6C1')(' Ingrese la fecha (YYYY-MM-DD):') }
                    ]);
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
                    console.log(chalk.hex('#FFB6C1')('Alimento registrado exitosamente'));
                    break;
                case "2":
                    const { clienteId } = await inquirer.prompt([
                        { type: 'input', name: 'clienteId', message: chalk.hex('#FFB6C1')('Ingrese el ID del cliente para generar el reporte:') }
                    ]);

                    const reporte = await PlanAlimentacion.reporteSemanal(clienteId);

                    if (reporte.length === 0) {
                        console.log(chalk.hex('#FF69B4')('No hay registros de alimentos en la última semana.'));
                    } else {
                        console.log(chalk.hex('#D8BFD8')('Reporte semanal:'));
                        console.log(chalk.hex('#FFB6C1')(`Total calorías: ${reporte[0].calorias}`));
                        console.log(chalk.hex('#FFDAB9')(`Alimentos: ${reporte[0].alimentos}`));
                    }
                    break;
                case "3":
                    console.log(chalk.hex('#BA55D3')('Saliendo... ¡Hasta pronto!'));
                    salir = true;
                    break;

            }
        } catch (error) {
            console.log(chalk.hex('#FF69B4')(' Error al gestionar plan nutricion:'), error);
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
                message: chalk.hex('#D8BFD8')(' Ingresa la opción que deseas:'),
                choices: [
                    { name: chalk.hex('#FFB6C1')('1. Registrar ingresos (Mensualidades)'), value: "1" },
                    { name: chalk.hex('#FFB6C1')('2. Registrar egresos'), value: '2' },
                    { name: chalk.hex('#FFB6C1')('3. Consultar balance financiero'), value: '3' },
                    { name: chalk.hex('#FFB6C1')('4. Salir'), value: '4' }
                ]
            }]);
            switch (opcion) {
                case "1":
                    const { clienteId, plan, precio } = await inquirer.prompt([
                        { type: "input", name: "clienteId", message: chalk.hex('#FFB6C1')(' Ingrese ID del cliente:') },
                        { type: "input", name: "plan", message: chalk.hex('#FFB6C1')('Ingrese nombre del plan:') },
                        { type: "number", name: "precio", message: chalk.hex('#FFB6C1')('Ingrese el precio de la mensualidad:') }
                    ]);
                    const mensualidad = new Mensualidades(clienteId, plan, precio);
                    await mensualidad.actualizarIngresos(precio);
                    console.log(chalk.hex('#FFB6C1')(`Mensualidad de ${plan} registrada con éxito`));
                    break;
                case "2":
                    const { pagoEntrenadores, servicios, mantenimiento, suplementos } = await inquirer.prompt([
                        { type: "number", name: "pagoEntrenadores", message: chalk.hex('#FFB6C1')('Monto pago entrenadores:') },
                        { type: "number", name: "servicios", message: chalk.hex('#FFB6C1')('Monto servicios:') },
                        { type: "number", name: "mantenimiento", message: chalk.hex('#FFB6C1')('Monto mantenimiento de máquinas:') },
                        { type: "number", name: "suplementos", message: chalk.hex('#FFB6C1')('Monto suplementos:') }
                    ]);

                    const egresos = new Servicios(pagoEntrenadores, servicios, mantenimiento, suplementos);
                    const totalEgresos = pagoEntrenadores + servicios + mantenimiento + suplementos;
                    await egresos.actualizarEgresos(totalEgresos);
                    await egresos.registrarEgresos();
                    console.log(chalk.hex('#FFDAB9')('Egresos registrados correctamente'));
                    break;
                case "3":
                    console.log(chalk.hex('#D8BFD8')('Consultando balance financiero...'));
                    await balanceFinanciero();
                    break;
                case "4":
                    console.log(chalk.hex('#BA55D3')('Saliendo... ¡Hasta pronto!'));
                    salir = true;
                    break;
            }


        } catch (error) {
            console.log(chalk.hex('#FF69B4')('Error al gestionar gestion financiera:'), error);
        }
    }

}

async function menuReporte() {
    let salir = false;
    while (!salir) {
        try {
            const { opcion } = await inquirer.prompt([{
                type: 'list',
                name: 'opcion',
                message: chalk.hex('#D8BFD8')("Selecciona la ocpion que desea ejecutar:"),
                choices: [
                    { name: chalk.hex('#FFB6C1')('1.GEnerar reporte de cliente'), value: "1" },
                    { name: chalk.hex('#FFB6C1')('2. Salir'), value: "2" },
                ]
            }]);
            switch (opcion) {
                case "1":
                    const informacion=await inquirer.prompt([{
                        type:"input",
                        name:"nombre",
                        message:"Ingrese el nombre del cliente a generar el reporte:"
                    }])
                    if(!informacion.nombre){
                        console.log("Error, el cliente no existe")
                    }
                    console.log(chalk.hex('#FFDAB9')(" Generando reporte de clientes..."));
                    const clientes = await LeerInfoClientes(); 
                    console.log(clientes);
                    break
                case "2":
                    salir = true;
                    break;
            }
        } catch (error) {
            console.log(chalk.hex('#FF69B4')('Error al gestionar menu reporte:'), error);
        }
    }
}

async function menu() {
    let salir = false;
    while (!salir) {
        try {
            const { db } = await conectar();

            const respuesta = await inquirer.prompt([{
                type: 'list',
                name: 'opcion',
                message: chalk.hex('#D8BFD8')('🌸 Bienvenido a nuestro Gym Valmi, selecciona una opción:'),
                choices: [
                    { name: chalk.hex('#FFB6C1')("1. Gestionar Clientes"), value: "1" },
                    { name: chalk.hex('#FFB6C1')("2. Gestionar Planes De Entrenamiento"), value: "2" },
                    { name: chalk.hex('#FFB6C1')("3. Seguimiento Físico"), value: "3" },
                    { name: chalk.hex('#FFB6C1')("4. Crear Plan De Nutrición"), value: "4" },
                    { name: chalk.hex('#FFB6C1')("5. Gestión Financiera"), value: "5" },
                    { name: chalk.hex('#FFB6C1')("6. Generar reporte"), value: "6" },
                    { name: chalk.hex('#FFB6C1')("7. Salir"), value: "7" }
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
                    break
                case "4":
                    await planNutricion();
                    break;
                case "5":
                    await gestionFinanciera();
                    break;
                case "6":
                    await menuReporte();
                    break
                case "7":
                    console.log(chalk.hex('#BA55D3')('Saliendo... ¡Hasta pronto!'));
                    salir = true;
                    break;
            }
        } catch (error) {
            console.log(chalk.hex('#FF69B4')('Error al ejecutar menu principal:'), error);
        }
    }
}

menu();