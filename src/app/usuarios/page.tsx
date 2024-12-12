"use client"
import { useEffect, useState, useRef, FormEvent } from "react";
import { FiTrash, FiEdit, FiCheck } from "react-icons/fi"
import { api } from "../api";

interface UsuarioProps {
  id: string;
  matricula: string;
  perfil_id: string;
}

export default function Usuario() {

  // Linkar os inputs
  const matriculaRef = useRef<HTMLInputElement | null>(null);
  const perfil_idRef = useRef<HTMLInputElement | null>(null);

  // Inicializa lista de tarefas da página como lista vazia
  const [usuarios, setUsuario] = useState<UsuarioProps[]>([])
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<UsuarioProps>>({});

  // Ao renderizar a página, chama a função "readTasks"
  useEffect(() => {
    readUsuario();
  }, [])

  // Busca as tarefas no banco de dados via API
  async function readUsuario() {
    try {
      const response = await api.get("/usuarios")
      console.log(response.data)
      setUsuario(Array.isArray(response.data) ? response.data : [])
    }
    catch (error) {
      console.error("Error fetching tasks:", error);
      setUsuario([])

    }
  }

  // Cria uma nova tarefa
  async function createUsuario(event: FormEvent) {
    event.preventDefault()
    const response = await api.post("/usuarios", {
      matricula: matriculaRef.current?.value,
      perfil_id: perfil_idRef.current?.value
    });

    setUsuario(allUsuario => [...allUsuario, response.data])
  }

  function startEditing(usuarios: UsuarioProps) {
    setEditingId(usuarios.id);
    setEditValues(usuarios);
  }

  // Função para salvar alterações no usuarios
  async function updateUsuario(id: string) {
    try {
      await api.put("/usuarios/" + id, editValues);
      setEditingId(null);
      setEditValues({});
      readUsuario(); // Atualiza a lista de usuarios
    } catch (error) {
      console.error("Error updating usuarios:", error);
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
  async function deleteUsuario(id: string) {
    try {
      await api.delete("/usuarios/" + id)
      const allUsuario = usuarios.filter((usuarios) => usuarios.id !== id)
      setUsuario(allUsuario)
    }
    catch (err) {
      alert(err)
    }
  }



  async function setUsuarioDone(id: string) {
    try {
      await api.put("/usuarios/" + id, {
        ativo: true,
      })
      const response = await api.get("/usuarios")
      setUsuario(response.data)
    }
    catch (err) {
      alert(err)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-500 flex justify-center px-4">
      <main className="my-10 w-full lg:max-w-5xl">
        <section>
          <h1 className="text-4xl text-slate-200 font-medium text-center">Usuarios</h1>

          <form className="flex flex-col my-6" onSubmit={createUsuario}>

            <label className="text-slate-200">Matrícula do usuário:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={matriculaRef} />
            <label className="text-slate-200">ID do perfil</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={perfil_idRef} />
            <input type="submit" value={"Adicionar Usuario"} className="cursor-pointer w-full bg-slate-800 rounded font-medium text-slate-200 p-4" />
          </form>

        </section>
        <section className="mt-5 flex flex-col">

          {usuarios.length > 0 ? (
            usuarios.map((usuarios) => (
              <article className="w-full bg-slate-200 text-slate-800 p-2 mb-4 rounded relative hover:bg-sky-300" key={usuarios.id}>
                {editingId === usuarios.id ? (
                  <div>
                    <input
                      type="text"
                      name="matricula"
                      value={editValues.matricula || ""}
                      onChange={handleInputChange}
                      className="mb-2 p-2 w-full rounded"
                    />
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => updateUsuario(usuarios.id)}
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>{usuarios.matricula}</p>

                    <button
                      className="flex absolute right-20 -top-2 bg-yellow-500 w-7 h-7 items-center justify-center text-slate-200"
                      onClick={() => startEditing(usuarios)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="flex absolute right-10 -top-2 bg-green-600 w-7 h-7 items-center justify-center text-slate-200"
                      onClick={() => setUsuarioDone(usuarios.id)}
                    >
                      <FiCheck />
                    </button>
                  </div>
                )}
                <button
                  className="flex absolute right-0 -top-2 bg-red-600 w-7 h-7 items-center justify-center text-slate-200"
                  onClick={() => deleteUsuario(usuarios.id)}
                >
                  <FiTrash />
                </button>
              </article>

            ))
          ) : (
            <p className="text-center text-gray-500">No usuarios available</p>
          )}
        </section>
      </main>
    </div>
  );
}