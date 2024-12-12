"use client"
import { useEffect, useState, useRef, FormEvent } from "react";
import { FiTrash, FiEdit, FiCheck } from "react-icons/fi"
import { api } from "../api";

interface CursoProps {
  id: string;
  descricao: string;
  grau: string;
  nivel_serie: string;
  modalidade: string;
  ativo: boolean;
}

export default function Curso() {

  // Linkar os inputs
  const descricaoRef = useRef<HTMLInputElement | null>(null);
  const grauRef = useRef<HTMLInputElement | null>(null);
  const nivel_serieRef = useRef<HTMLInputElement | null>(null);
  const modalidadeRef = useRef<HTMLInputElement | null>(null);

  // Inicializa lista de tarefas da página como lista vazia
  const [cursos, setCurso] = useState<CursoProps[]>([])
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CursoProps>>({});

  // Ao renderizar a página, chama a função "readTasks"
  useEffect(() => {
    readCurso();
  }, [])

  // Busca as tarefas no banco de dados via API
  async function readCurso() {
    try {
      const response = await api.get("/cursos")
      console.log(response.data)
      setCurso(Array.isArray(response.data) ? response.data : [])
    }
    catch (error) {
      console.error("Error fetching tasks:", error);
      setCurso([])

    }
  }

  // Cria uma nova tarefa
  async function createCurso(event: FormEvent) {
    event.preventDefault()
    const response = await api.post("/cursos", {
      descricao: descricaoRef.current?.value,
      grau: grauRef.current?.value,
      nivel_serie: nivel_serieRef.current?.value,
      modalidade: modalidadeRef.current?.value,
    });

    setCurso(allCurso => [...allCurso, response.data])
  }

  function startEditing(cursos: CursoProps) {
    setEditingId(cursos.id);
    setEditValues(cursos);
  }

  // Função para salvar alterações no cursos
  async function updateCurso(id: string) {
    try {
      await api.put("/cursos/" + id, editValues);
      setEditingId(null);
      setEditValues({});
      readCurso(); // Atualiza a lista de cursos
    } catch (error) {
      console.error("Error updating cursos:", error);
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
  async function deleteCurso(id: string) {
    try {
      await api.delete("/cursos/" + id)
      const allCurso = cursos.filter((cursos) => cursos.id !== id)
      setCurso(allCurso)
    }
    catch (err) {
      alert(err)
    }
  }



  async function setCursoDone(id: string) {
    try {
      await api.put("/cursos/" + id, {
        ativo: true,
      })
      const response = await api.get("/cursos")
      setCurso(response.data)
    }
    catch (err) {
      alert(err)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-500 flex justify-center px-4">
      <main className="my-10 w-full lg:max-w-5xl">
        <section>
          <h1 className="text-4xl text-slate-200 font-medium text-center">Cursos</h1>

          <form className="flex flex-col my-6" onSubmit={createCurso}>

            <label className="text-slate-200">Descrição do Curso:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={descricaoRef} />
            <label className="text-slate-200">Grau dos curso:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={grauRef} />
            <label className="text-slate-200">Nivel/Serie do curso:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={nivel_serieRef} />
            <label className="text-slate-200">Modalidade do curso:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={modalidadeRef} />

            <input type="submit" value={"Adicionar Curso"} className="cursor-pointer w-full bg-slate-800 rounded font-medium text-slate-200 p-4" />
          </form>

        </section>
        <section className="mt-5 flex flex-col">

          {cursos.length > 0 ? (
            cursos.map((cursos) => (
              <article className="w-full bg-slate-200 text-slate-800 p-2 mb-4 rounded relative hover:bg-sky-300" key={cursos.id}>
                {editingId === cursos.id ? (
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
                      name="grau"
                      value={editValues.grau || ""}
                      onChange={handleInputChange}
                      className="mb-2 p-2 w-full rounded"
                    />
                    <input
                      type="text"
                      name="nivel_serie"
                      value={editValues.nivel_serie || ""}
                      onChange={handleInputChange}
                      className="mb-2 p-2 w-full rounded"
                    />
                    <input
                      type="text"
                      name="modalidade"
                      value={editValues.modalidade || ""}
                      onChange={handleInputChange}
                      className="mb-2 p-2 w-full rounded"
                    />
                    <label>
                      <input
                        type="checkbox"
                        name="ativo"
                        checked={editValues.ativo || false}
                        onChange={handleInputChange}
                      />
                      Ativo
                    </label>

                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => updateCurso(cursos.id)}
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>{cursos.descricao}</p>
                    <p>{cursos.grau}</p>
                    <p>{cursos.nivel_serie}</p>
                    <p>{cursos.modalidade}</p>
                    <p>Ativo: {cursos.ativo.toString()}</p>

                    <button
                      className="flex absolute right-20 -top-2 bg-yellow-500 w-7 h-7 items-center justify-center text-slate-200"
                      onClick={() => startEditing(cursos)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="flex absolute right-10 -top-2 bg-green-600 w-7 h-7 items-center justify-center text-slate-200"
                      onClick={() => setCursoDone(cursos.id)}
                    >
                      <FiCheck />
                    </button>
                  </div>
                )}
                <button
                  className="flex absolute right-0 -top-2 bg-red-600 w-7 h-7 items-center justify-center text-slate-200"
                  onClick={() => deleteCurso(cursos.id)}
                >
                  <FiTrash />
                </button>
              </article>

            ))
          ) : (
            <p className="text-center text-gray-500">No cursos available</p>
          )}
        </section>
      </main>
    </div>
  );
}