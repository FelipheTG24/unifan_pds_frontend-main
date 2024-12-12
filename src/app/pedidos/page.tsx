"use client"
import { useEffect, useState, useRef, FormEvent } from "react";
import { FiTrash, FiEdit, FiCheck } from "react-icons/fi"
import { api } from "../api";

interface PedidoProps {
    id: string;
    dataHoraPedido: Date;
    statusPedido: boolean;
    pagamento_id: string;
    usuario_id: string;
}

export default function Pedido() {

  // Linkar os inputs
  const pagamento_idRef = useRef<HTMLInputElement | null>(null);
  const usuario_idRef = useRef<HTMLInputElement | null>(null);

  // Inicializa lista de tarefas da página como lista vazia
  const [pedidos, setPedido] = useState<PedidoProps[]>([])
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<PedidoProps>>({});

  // Ao renderizar a página, chama a função "readTasks"
  useEffect(() => {
    readPedido();
  }, [])

  // Busca as tarefas no banco de dados via API
  async function readPedido() {
    try {
      const response = await api.get("/pedidos")
      console.log(response.data)
      setPedido(Array.isArray(response.data) ? response.data : [])
    }
    catch (error) {
      console.error("Error fetching tasks:", error);
      setPedido([])

    }
  }

  // Cria uma nova tarefa
  async function createPedido(event: FormEvent) {
    event.preventDefault()
    const response = await api.post("/pedidos", {
      pagamento_id: pagamento_idRef.current?.value,
      usuario_id: usuario_idRef.current?.value
    });

    setPedido(allPedido => [...allPedido, response.data])
  }

  function startEditing(pedidos: PedidoProps) {
    setEditingId(pedidos.id);
    setEditValues(pedidos);
  }

  // Função para salvar alterações no pedidos
  async function updatePedido(id: string) {
    try {
      await api.put("/pedidos/" + id, editValues);
      setEditingId(null);
      setEditValues({});
      readPedido(); // Atualiza a lista de pedidos
    } catch (error) {
      console.error("Error updating pedidos:", error);
    }
  }

  // Função para lidar com mudanças nos inputs de edição
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Deleta uma tarefa
  async function deletePedido(id: string) {
    try {
      await api.delete("/pedidos/" + id)
      const allPedido = pedidos.filter((pedidos) => pedidos.id !== id)
      setPedido(allPedido)
    }
    catch (err) {
      alert(err)
    }
  }



  async function setPedidoDone(id: string) {
    try {
      await api.put("/pedidos/" + id, {
        statusPedido: true,
      })
      const response = await api.get("/pedidos")
      setPedido(response.data)
    }
    catch (err) {
      alert(err)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-500 flex justify-center px-4">
      <main className="my-10 w-full lg:max-w-5xl">
        <section>
          <h1 className="text-4xl text-slate-200 font-medium text-center">Pedidos</h1>

          <form className="flex flex-col my-6" onSubmit={createPedido}>

            <label className="text-slate-200">ID do pagamento:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={pagamento_idRef} />
            <label className="text-slate-200">ID do usuário:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={usuario_idRef} />

            <input type="submit" value={"Adicionar Pedido"} className="cursor-pointer w-full bg-slate-800 rounded font-medium text-slate-200 p-4" />
          </form>

        </section>
        <section className="mt-5 flex flex-col">

          {pedidos.length > 0 ? (
            pedidos.map((pedidos) => (
              <article className="w-full bg-slate-200 text-slate-800 p-2 mb-4 rounded relative hover:bg-sky-300" key={pedidos.id}>
                {editingId === pedidos.id ? (
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        name="statusPedido"
                        checked={editValues.statusPedido || false}
                        onChange={handleInputChange}
                      />
                      Ativo
                    </label>

                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => updatePedido(pedidos.id)}
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div>
                     <p>{new Date(pedidos.dataHoraPedido).toLocaleDateString()}</p>
                    <p>Ativo: {pedidos.statusPedido.toString()}</p>

                    <button
                      className="flex absolute right-20 -top-2 bg-yellow-500 w-7 h-7 items-center justify-center text-slate-200"
                      onClick={() => startEditing(pedidos)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="flex absolute right-10 -top-2 bg-green-600 w-7 h-7 items-center justify-center text-slate-200"
                      onClick={() => setPedidoDone(pedidos.id)}
                    >
                      <FiCheck />
                    </button>
                  </div>
                )}
                <button
                  className="flex absolute right-0 -top-2 bg-red-600 w-7 h-7 items-center justify-center text-slate-200"
                  onClick={() => deletePedido(pedidos.id)}
                >
                  <FiTrash />
                </button>
              </article>

            ))
          ) : (
            <p className="text-center text-gray-500">No pedidos available</p>
          )}
        </section>
      </main>
    </div>
  );
}