import { ObjectId } from "mongodb"

db.createCollection("clientes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "correo", "documento"],
      properties: {
        nombre: { bsonType: "string", description: "Nombre requerido" },
        correo: { bsonType: "string", pattern: "^\\S+@\\S+\\.\\S+$", description: "Correo válido requerido" },
        documento: { bsonType: "string", description: "Documento requerido" },
        planes: { bsonType: "string" },
        contratos: { bsonType: "array", items: { bsonType: "objectId" } },
        creadoEn: { bsonType: "date" }
      }
    }
  }
})


db.createCollection("planEntrenamiento", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "duracionSemanas", "metas", "nivel"],
      properties: {
        nombre: { bsonType: "string" },
        duracionSemanas: { bsonType: "number", minimum: 1 },
        metas: { bsonType: "array", items: { bsonType: "string" } },
        nivel: { enum: ["principiante", "intermedio", "avanzado"] },
        estado: { enum: ["activo", "cancelado", "finalizado"] },
        clienteId: { bsonType: "objectId" }
      }
    }
  }
})


db.createCollection("contratos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["clienteId", "planId", "condiciones", "duracionSemanas", "precio", "fechaInicio"],
      properties: {
        clienteId: { bsonType: "objectId" },
        planId: { bsonType: "objectId" },
        condiciones: { bsonType: "string" },
        duracionSemanas: { bsonType: ["int", "double"], minimum: 1 }, // 👈 acepta int o double
        precio: { bsonType: ["double", "int"], minimum: 0 },          // 👈 acepta double o int
        fechaInicio: { bsonType: "date" },
        fechaFin: { bsonType: "date" }
      }
    }
  }
});


db.createCollection("seguimientos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["clienteId", "planId", "registros"],
      properties: {
        clienteId: { bsonType: "objectId" },
        planId: { bsonType: "objectId" },
        registros: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["_id", "fecha", "peso", "grasa", "medidas"],
            properties: {
              _id: { bsonType: "objectId" },
              fecha: { bsonType: "date" },
              peso: { bsonType: "double" },
              grasa: { bsonType: "double" },
              medidas: { bsonType: "string" },
              fotos: { bsonType: "array", items: { bsonType: "string" } },
              comentario: { bsonType: "string" }
            }
          }
        },
        creadoEn: { bsonType: "date" }
      }
    }
  }
})


db.createCollection("seguimientoNutricional", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cliente", "plan", "descripcion", "alimento", "calorias", "fecha"],
      properties: {
        cliente: { bsonType: "objectId" },
        plan: { bsonType: "objectId" },
        descripcion: { bsonType: "string" },
        alimento: { bsonType: "string" },
        calorias: { bsonType: ["int", "double"], minimum: 0 }, // 👈 acepta ambos
        fecha: { bsonType: "date" }
      }
    }
  }
});



db.createCollection("finanzas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tipo", "monto", "fecha"],
      properties: {
        tipo: { enum: ["ingreso", "egreso"] },
        monto: { bsonType: ["int", "double"], minimum: 0 }, // 👈 acepta ambos
        fecha: { bsonType: "date" }
      }
    }
  }
});


db.createCollection("gastos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tipo", "monto", "fecha"],
      properties: {
        tipo: { enum: ["pagoEntrenadores", "servicios", "mantenimientoMaquinas", "suplementos"] },
        monto: { bsonType: ["int", "double"], minimum: 0 },
        fecha: { bsonType: "date" }
      }
    }
  }
})



// ====================== CLIENTES ======================
db.clientes.insertMany([
  {
    _id: ObjectId('68d6e9636fe92550cf3fb1a6'),
    nombre: "Laura Gómez",
    correo: "laura.gomez@example.com",
    documento: "1002003001",
    contratos: [],
    planes:"Plan Basico",
    creadoEn: new Date()
  },
  {
    _id: ObjectId('68d6e9636fe92550cf3fb1a7'),
    nombre: "Carlos Pérez",
    correo: "carlos.perez@example.com",
    documento: "1002003002",
    contratos: [],
    planes:"Plan Avanzado",
    creadoEn: new Date()
  }
]);

// ====================== PLANES DE ENTRENAMIENTO ======================
db.planEntrenamiento.insertMany([
  {
    _id: ObjectId('68d6e9636fe92550cf3fb1a8'),
    nombre: "Plan Básico",
    duracionSemanas: 8,
    metas: ["perder peso", "mejorar resistencia"],
    nivel: "principiante",
    estado: "activo"
  },
  {
    _id: ObjectId('68d6e9636fe92550cf3fb1a9'),
    nombre: "Plan Avanzado",
    duracionSemanas: 12,
    metas: ["ganar masa muscular", "mejorar fuerza"],
    nivel: "avanzado",
    estado: "activo"
  }
]);

// ====================== CONTRATOS ======================
db.collection("contratos").insertMany([
  {
    clienteId: new ObjectId("68d6e9636fe92550cf3fb1a6"),
    planId: new ObjectId("68d6e9636fe92550cf3fb1a8"),
    condiciones: "Acceso libre a máquinas y clases grupales",
    duracionSemanas: 8,              // int32
    precio: 200000.0,                // double
    fechaInicio: new Date(),
    fechaFin: (() => {
      const inicio = new Date();
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + (8 * 7));
      return fin;
    })()
  },
  {
    clienteId: new ObjectId("68d6e9636fe92550cf3fb1a7"),
    planId: new ObjectId("68d6e9636fe92550cf3fb1a9"),
    condiciones: "Acceso libre + entrenador personal",
    duracionSemanas: 12,
    precio: 400000.0,
    fechaInicio: new Date(),
    fechaFin: (() => {
      const inicio = new Date();
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + (12 * 7));
      return fin;
    })()
  }
]);



// ====================== SEGUIMIENTOS ======================
db.seguimientos.insertOne({
  clienteId: ObjectId("68d6e9636fe92550cf3fb1a6"), // 👈 cámbialo por el id real del cliente
  planId: ObjectId("68d6e9636fe92550cf3fb1a8"),    // 👈 cámbialo por el id real del plan
  registros: [
    {
      _id: ObjectId(),
      fecha: new Date(),
      peso: 60.5,
      grasa: 25.1,
      medidas: "90-70-95",
      fotos: ["foto1.jpg"],
      comentario: "Buen progreso esta semana"
    },
    {
      _id: ObjectId(),
      fecha: new Date(),
      peso: 59.8,
      grasa: 24.5,
      medidas: "89-69-94",
      fotos: ["foto2.jpg"],
      comentario: "Menos grasa corporal"
    }
  ],
  creadoEn: new Date()
});


// ====================== SEGUIMIENTO NUTRICIONAL ======================
db.seguimientoNutricional.insertMany([
  {
    cliente: ObjectId("68d6e9636fe92550cf3fb1a6"), // 👈 ID del cliente (Laura Gómez)
    plan: ObjectId("68d6e9636fe92550cf3fb1a8"),    // 👈 ID del plan (Plan Básico)
    descripcion: "Plan alimenticio semanal",
    alimento: "Pechuga de pollo",
    calorias: 250,  // se guarda como int/double según schema
    fecha: new Date()
  },
  {
    cliente: ObjectId("68d6e9636fe92550cf3fb1a6"), // 👈 mismo cliente
    plan: ObjectId("68d6e9636fe92550cf3fb1a8"),    // 👈 mismo plan
    descripcion: "Plan alimenticio semanal",
    alimento: "Ensalada mixta",
    calorias: 150,
    fecha: new Date()
  }
]);

// ====================== FINANZAS ======================
db.finanzas.insertMany([
  {
    tipo: "ingreso",
    monto: 200000,
    fecha: new Date()
  },
  {
    tipo: "ingreso",
    monto: 400000,
    fecha: new Date()
  },
  {
    tipo: "egreso",
    monto: 100000,
    fecha: new Date()
  }
]);

// ====================== GASTOS ======================
db.gastos.insertMany([
  { tipo: "pagoEntrenadores", monto: 50000, fecha: new Date() },
  { tipo: "servicios", monto: 20000, fecha: new Date() },
  { tipo: "mantenimientoMaquinas", monto: 30000, fecha: new Date() },
  { tipo: "suplementos", monto: 15000, fecha: new Date() }
]);
