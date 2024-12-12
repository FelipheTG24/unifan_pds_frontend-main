"use client"
import { useEffect, useState, useRef, FormEvent } from "react";
import { FiTrash, FiEdit, FiCheck } from "react-icons/fi"
import { api } from "../api";

interface ValoresProps {
    id: string;
    descricao: string;
    valor: number;
    data_inicio: Date;
    data_fim: Date;
}

export default function Valores() {

  // Linkar os inputs
  const descricaoRef = useRef<HTMLInputElement | null>(null);
  const valorRef = useRef<HTMLInputElement | null>(null);

  // Inicializa lista de tarefas da página como lista vazia
  const [valores, setValores] = useState<ValoresProps[]>([])
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ValoresProps>>({});

  // Ao renderizar a página, chama a função "readTasks"
  useEffect(() => {
    readValores();
  }, [])

  // Busca as tarefas no banco de dados via API
  async function readValores() {
    try {
      const response = await api.get("/valores")
      console.log(response.data)
      setValores(Array.isArray(response.data) ? response.data : [])
    }
    catch (error) {
      console.error("Error fetching tasks:", error);
      setValores([])

    }
  }

  // Cria uma nova tarefa
  async function createValores(event: FormEvent) {
    event.preventDefault()
    const response = await api.post("/valores", {
      descricao: descricaoRef.current?.value,
      valor: valorRef.current?.value,
    });
    
    setValores(allValores => [...allValores, response.data])
  }

  function startEditing(valores: ValoresProps) {
    setEditingId(valores.id);
    setEditValues(valores);
  }

  // Função para salvar alterações no valores
  async function updateValores(id: string) {
    try {
      await api.put("/valores/" + id, editValues);
      setEditingId(null);
      setEditValues({});
      readValores(); // Atualiza a lista de valores
    } catch (error) {
      console.error("Error updating valores:", error);
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
  async function deleteValores(id: string) {
    try {
      await api.delete("/valores/" + id)
      const allValores = valores.filter((valores) => valores.id !== id)
      setValores(allValores)
    }
    catch (err) {
      alert(err)
    }
  }



  async function setValoresDone(id: string) {
    try {
      await api.put("/valores/" + id, {
        status: true,
      })
      const response = await api.get("/valores")
      setValores(response.data)
    }
    catch (err) {
      alert(err)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-500 flex justify-center px-4">
      <main className="my-10 w-full lg:max-w-5xl">
        <section>
          <h1 className="text-4xl text-slate-200 font-medium text-center">Valores</h1>

          <form className="flex flex-col my-6" onSubmit={createValores}>

            <label className="text-slate-200">Descrição do Valores</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={descricaoRef} />
            <label className="text-slate-200">Valor:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={valorRef} />

            <input type="submit" value={"Adicionar Valores"} className="cursor-pointer w-full bg-slate-800 rounded font-medium text-slate-200 p-4" />
          </form>

        </section>
        <section className="mt-5 flex flex-col">

          {valores.length > 0 ? (
            valores.map((valores) => (
              <article className="w-full bg-slate-200 text-slate-800 p-2 mb-4 rounded relative hover:bg-sky-300" key={valores.id}>
                {editingId === valores.id ? (
                  <div>
                    <input
                      type="text"
                      name="descricao"
                      value={editValues.descricao || ""}
                      onChange={handleInputChange}
                      className="mb-2 p-2 w-full rounded"
                    />
                     <input
                      type="text"
                      name="valor"
                      value={editValues.valor || ""}
                      onChange={handleInputChange}
                      className="mb-2 p-2 w-full rounded"
                    />
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => updateValores(valores.id)}
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>{valores.descricao}</p>
                    <p>{valores.valor}</p>
                    <p>{new Date(valores.data_inicio).toLocaleDateString()}</p>
                    <p>{new Date(valores.data_fim).toLocaleDateString()}</p>

                    <button
                      className="flex absolute right-20 -top-2 bg-yellow-500 w-7 h-7 items-center justify-center text-slate-200"
                      onClick={() => startEditing(valores)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="flex absolute right-10 -top-2 bg-green-600 w-7 h-7 items-center justify-center text-slate-200"
                      onClick={() => setValoresDone(valores.id)}
                    >
                      <FiCheck />
                    </button>
                  </div>
                )}
                <button
                  className="flex absolute right-0 -top-2 bg-red-600 w-7 h-7 items-center justify-center text-slate-200"
                  onClick={() => deleteValores(valores.id)}
                >
                  <FiTrash />
                </button>
              </article>

            ))
          ) : (
            <p className="text-center text-gray-500">No valores available</p>
          )}
        </section>
      </main>
    </div>
  );
}