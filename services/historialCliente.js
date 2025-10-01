export async function historialCliente(){
    const db = await conectar();
    
    const {clienteId} = await inquirer. prompt([
        {type: "input", name:"clienteId", message:"IDdelCliente"},
    ]);
    const spinner = ora("Generando historial").start();
    try {
        const hist = [
            {$match: {clienteId: new ObjectId(clienteId)}},
            {$sort: {fecha:1}},
        ];
        const Historial = await db.collection ("")
    }
}