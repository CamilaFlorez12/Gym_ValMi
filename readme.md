# 🏋️‍♀️ Gym CLI ValMi

![Gym portada](./multimedia/portada%20gym.png)

## 📌 Descripción del Proyecto
Este proyecto consiste en una aplicación de línea de comandos (CLI) desarrollada en **Node.js**, orientada a la gestión integral de un gimnasio.  
La herramienta permite administrar clientes, planes de entrenamiento, nutrición, contratos, progresos físicos y gestión financiera.  
Se hace uso de **MongoDB (driver oficial)**, **Programación Orientada a Objetos**, principios **SOLID** y patrones de diseño.
<p align="center">
  <img src="https://img.shields.io/github/repo-size/CamilaFlorez12/Gym_ValMi?style=flat-square&color=ff69b4" />
  <img src="https://img.shields.io/github/last-commit/CamilaFlorez12/Gym_ValMi?style=flat-square&color=purple" />
  <img src="https://img.shields.io/github/contributors/CamilaFlorez12/Gym_ValMi?style=flat-square&color=blueviolet" />
</p>


## 🌷 Instrucciones de Instalación y Uso

### 🌼 Requisitos Previos
- [Node.js](https://nodejs.org/)  
- [MongoDB](https://www.mongodb.com/) instalado  
- npm  

### ⚙️ Instalación
```bash
# Clonar el repositorio
git clone https://github.com/CamilaFlorez12/Gym_ValMi

# Ingresar al proyecto
cd gym-cli-ValMi

# Instalar dependencias
npm install
```

### ▶️ Ejecución
```bash
# Iniciar aplicación CLI
npm start
```

---

## 📂 Estructura del Proyecto
```
Gym_ValMi-main/
├── .gitignore
├── index.js
├── readme.md
├── package-lock.json
├── package.json
├── models
     └── schema.js
├── Services
      ├── contratos.js
      ├── gestionFinanciera.js
      ├── gestion_clientes.js
      ├── nutricion.js
      ├── seguimiento_fisico.js
      └── planEntrenamiento.js
├── Utils
      └── persistenciaArchivos.js
└── multimedia/
      ├── UML gym.webp
      └── portada gym.png

```

---

| 🌟 Principio                  | 💡 Aplicación                                                  |
| ----------------------------- | -------------------------------------------------------------- |
| **S** → Single Responsibility | Cada clase gestiona solo su entidad (cliente, plan, contrato). |
| **O** → Open/Closed           | Se pueden extender servicios sin modificar los existentes.     |
| **L** → Liskov Substitution   | Herencia coherente: clases hijas sustituyen sin romper nada.   |
| **I** → Interface Segregation | Servicios separados para finanzas, nutrición y progreso.       |
| **D** → Dependency Inversion  | Dependemos de abstracciones y no de implementaciones directas. |


---

## 🎀 Patrones de diseño usados
- **Repository Pattern:** Implementado en `/services` para la interacción con MongoDB.
- **Factory Pattern:** Creación de contratos y planes desde métodos centralizados.
- **Command Pattern:** Manejo de comandos CLI mediante `inquirer`.
- **Observer Pattern (Opcional):** Para notificaciones de progreso o pagos.

---


### 📌 1. Repository Pattern
Aplicado en la gestión de clientes y planes. La función `gestionClientes` actúa como un **repositorio**, ocultando la lógica de acceso a datos en MongoDB y ofreciendo métodos de alto nivel.

```js
export function gestionClientes(db) {
  const clientes = db.collection("clientes");
  const planes = db.collection("planes");
  const contratos = db.collection("contratos");

  return {
    async crearCliente(data) {
      return await clientes.insertOne(data);
    },

    async listarClientes() {
      return await clientes.find().toArray();
    },

    async actualizarCliente(id, data) {
      return await clientes.updateOne({ _id: new ObjectId(id) }, { $set: data });
    },

    async eliminarCliente(id) {
      return await clientes.deleteOne({ _id: new ObjectId(id) });
    },
  };
}
```

✅ **Explicación:**  
- Centraliza las operaciones sobre la colección de **clientes**.  
- Aísla al resto de la aplicación de los detalles de MongoDB.  
- Facilita pruebas y mantenimiento.

---

### 📌 2. Factory Pattern
Usado para **crear contratos automáticamente** cuando se asigna un plan a un cliente.

```js
async function asignarPlanACliente(clienteId, planId) {
  const contrato = {
    clienteId,
    planId,
    condiciones: "Entrenamiento personalizado",
    precio: 100,
    fechaInicio: dayjs().toDate(),
    fechaFin: dayjs().add(1, "month").toDate(),
    estado: "activo",
  };

  await contratos.insertOne(contrato);
}
```

✅ **Explicación:**  
- El objeto `contrato` se **genera automáticamente** a partir de la asignación del plan.  
- La lógica de creación está centralizada (Factory).  
- Asegura que todos los contratos tengan la misma estructura y validaciones.

---

### 📌 3. Command Pattern
Se aplica en la **interfaz CLI con `inquirer`**. Cada comando representa una **acción encapsulada** que el usuario puede ejecutar.

```js
import inquirer from "inquirer";

async function mostrarMenu() {
  const { accion } = await inquirer.prompt([
    {
      type: "list",
      name: "accion",
      message: "¿Qué deseas hacer?",
      choices: [
        "Crear cliente",
        "Listar clientes",
        "Actualizar cliente",
        "Eliminar cliente",
        "Asignar plan a cliente",
      ],
    },
  ]);

  switch (accion) {
    case "Crear cliente":
      return await gestionClientes(db).crearCliente(...);
    case "Listar clientes":
      return await gestionClientes(db).listarClientes();
    // ...
  }
}
```

✅ **Explicación:**  
- Cada opción del menú corresponde a un comando.  
- El `switch` ejecuta la acción encapsulada en un método del servicio.  
- Desacopla la interfaz de usuario (CLI) de la lógica de negocio.

---

## ⚙️ Consideraciones Técnicas
- Uso del **driver oficial de MongoDB**.
- Implementación de **transacciones reales** para operaciones críticas (pagos, contratos, cancelaciones).
- Validaciones estrictas en los modelos (`/models`).
- Aplicación de **Programación Orientada a Objetos** en toda la arquitectura.
- Librerías utilizadas:  
  - `inquirer` → CLI interactivo  
  - `chalk` → Estilos en consola  
  - `dotenv` → Manejo de variables de entorno  
  - `dayjs` → Manejo de fechas  

---

## 📊 UML del Proyecto
Un diagrama UML de clases se encuentra en el directorio `/multimedia/uml`.  
![Diagrama UML](./multimedia/UML%20gym.webp)

---

## 📅 Planeación Scrum
- 🌸  **Scrum Master:** Camila Florez 
- 💕 **Product Owner:** Valentina Delgado 
- 💖 **Developers:** Camila Florez, Valentina Delgado 

Los detalles completos de la planeación se encuentran en el documento PDF adjunto en:  
📖 [Acceder a la planeación](./multimedia/Gimnasio%20ValMi.pdf) 

---

## 📸💎 Video Explicativo
Un video de máximo 7 minutos explicando la aplicación de principios SOLID y patrones de diseño, junto con ejemplos del código:  
💻 [Ver video](https://drive.google.com/file/d/1jLplpc8ec9yXNMz6pPm7-vVOkeoZZ6ft/view?usp=drivesdk)

---

## 👨‍💻 Créditos
Proyecto desarrollado por:  
- **Valentina Delgado y Camila Florez**  
Proyecto node.js / U1  
Año 2025

---
