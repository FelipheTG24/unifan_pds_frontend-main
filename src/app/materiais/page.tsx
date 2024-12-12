"use client"; // Marca este componente como Client Component

import { useEffect, useState, useRef, FormEvent } from "react";
import { FiTrash, FiEdit, FiCheck, FiDownload } from "react-icons/fi";
import { api } from "../api";

// Definição do tipo para BufferFile
interface BufferFile {
  type: 'Buffer';
  data: Uint8Array;
}

// Definição do tipo MaterialFile que pode ser um File ou BufferFile
type MaterialFile = File | BufferFile;

interface MaterialProps {
  id: string;
  file: MaterialFile;
  curso_id: string;
  turma_periodo: string;
  usuario_id: string;
}

// Type guard para verificar se material.file é um File
function isFile(file: MaterialFile | undefined): file is File {
  return file !== null && file !== undefined && 'name' in file && (file as File).name !== undefined;
}



function renderBufferFile(file: BufferFile) {
  if (file && file.data) {
    const blob = new Blob([file.data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    return (
      <div className="text-sm text-slate-600">
        <p>Arquivo Buffer (tamanho: {file.data.length} bytes)</p>
        <a href={url} download={`arquivo_buffer_${file.data.length}bytes`} className="text-blue-500 hover:underline">
          Baixar Arquivo
        </a>
      </div>
    );
  }
  return <p className="text-slate-600">Erro ao carregar o arquivo Buffer.</p>;
}

// Função genérica para renderizar qualquer arquivo
function renderMaterialFile(file: MaterialFile) {
  if (isFile(file)) {
    return (
      <div className="text-sm text-slate-600">
        <p>Arquivo: {file.name}</p>
        <a
          href={URL.createObjectURL(file)}
          download={file.name}
          className="text-blue-500 hover:underline"
        >
          Baixar Arquivo
        </a>
      </div>
    );
  } else {
    return renderBufferFile(file as BufferFile);
  }
}

export default function Material() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const turmaPeriodoRef = useRef<HTMLInputElement | null>(null);
  const usuario_idRef = useRef<HTMLInputElement | null>(null);
  const curso_idRef = useRef<HTMLInputElement | null>(null);

  const [materiais, setMateriais] = useState<MaterialProps[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<MaterialProps | null>(null);

  useEffect(() => {
    readMateriais();
  }, []);

  async function readMateriais() {
    try {
      const response = await api.get("/materiais");
      if (Array.isArray(response.data)) {
        setMateriais(response.data);
      } else {
        console.error("A resposta da API não é um array:", response.data);
        setMateriais([]);
      }
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
      setMateriais([]);
    }
  }

  async function createMaterial(event: FormEvent) {
    event.preventDefault();
    try {
      const file = fileRef.current?.files ? fileRef.current.files[0] : null;
      const response = await api.post("/materiais", {
        file,
        turma_periodo: turmaPeriodoRef.current?.value,
        curso_id: curso_idRef.current?.value,
        usuario_id: usuario_idRef.current?.value
      });
      setMateriais(allMateriais => [...allMateriais, response.data]);
    } catch (error) {
      console.error("Erro ao criar material:", error);
      alert("Não foi possível criar o material");
    }
  }

  async function deleteMaterial(id: string) {
    try {
      await api.delete("/materiais/" + id);
      const allMateriais = materiais.filter((material) => material.id !== id);
      setMateriais(allMateriais);
    } catch (error) {
      console.error("Erro ao deletar material:", error);
      alert("Não foi possível deletar o material");
    }
  }

  async function editMaterial(id: string) {
    // Busca o material para edição
    const materialToEdit = materiais.find(material => material.id === id);

    if (materialToEdit) {
      // Define o material a ser editado no estado (para exibir no formulário de edição)
      setEditingMaterial(materialToEdit);
    }
  }

  async function saveEditMaterial() {
    if (!editingMaterial) return;
  
    try {
      const updatedMaterial = {
        ...editingMaterial,
        turma_periodo: turmaPeriodoRef.current?.value || editingMaterial.turma_periodo,
        file: fileRef.current?.files ? fileRef.current.files[0] : editingMaterial.file, // Garantir que o novo arquivo seja utilizado
      };
  
      // Envia as alterações para a API
      await api.put(`/materiais/${editingMaterial.id}`, updatedMaterial);
  
      // Atualiza o estado local com o material modificado
      setMateriais(materiais.map(material =>
        material.id === updatedMaterial.id ? updatedMaterial : material
      ));
  
      // Limpar o estado de edição (fecha o formulário de edição)
      setEditingMaterial(null);
    } catch (error) {
      console.error("Erro ao editar material:", error);
      alert("Não foi possível editar o material");
    }
  }
  

  function renderErrorMessage() {
    return <p className="text-slate-600">Erro ao carregar o arquivo Buffer.</p>;
  }

  return (
    <div className="w-full min-h-screen bg-slate-500 flex justify-center px-4">
      <main className="my-10 w-full lg:max-w-5xl">
        <section>
          <h1 className="text-4xl text-slate-200 font-medium text-center">
            Inserir Material
          </h1>

          <form className="flex flex-col my-6" onSubmit={createMaterial}>
            <label className="text-slate-200">File upload</label>
            <input type="file" className="w-full mb-5 p-2 rounded" ref={fileRef} />

            <label className="text-slate-200">Turma/Periodo</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={turmaPeriodoRef} />

            <label className="text-slate-200">ID do curso:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={curso_idRef} />

            <label className="text-slate-200">ID do usuário:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={usuario_idRef} />

            <input
              type="submit"
              value={"Add Material"}
              className="cursor-pointer w-full bg-slate-800 rounded font-medium text-slate-200 p-4"
            />
          </form>
        </section>

        <section className="mt-5 flex flex-col">
          {Array.isArray(materiais) && materiais.length > 0 ? (
            materiais.map((material) => (
              <article
                key={material.id}
                className="w-full bg-slate-200 text-slate-800 p-2 mb-4 rounded relative hover:bg-sky-300"
              >
                <p>{material.turma_periodo}</p>
                {renderMaterialFile(material.file)}
                <button
                  className="flex absolute right-10 -top-2 bg-yellow-600 w-7 h-7 items-center justify-center text-slate-200"
                  onClick={() => editMaterial(material.id)}
                >
                  <FiEdit />
                </button>

                <button
                  className="flex absolute right-0 -top-2 bg-red-600 w-7 h-7 items-center justify-center text-slate-200"
                  onClick={() => deleteMaterial(material.id)}
                >
                  <FiTrash />
                </button>
              </article>
            ))
          ) : (
            <p className="text-slate-200">Nenhum material encontrado.</p>
          )}
        </section>

        {/* Se estiver editando, mostra o formulário de edição */}
        {editingMaterial && (
          <section>
            <h2 className="text-2xl text-slate-200">Editar Material</h2>
            <form
              className="flex flex-col my-6"
              onSubmit={(e) => {
                e.preventDefault();
                saveEditMaterial();
              }}
            >
              <label className="text-slate-200">File upload</label>
              <input
                type="file"
                className="w-full mb-5 p-2 rounded"
                ref={fileRef}
                defaultValue={isFile(editingMaterial.file) ? editingMaterial.file.name : ""}
              />

              <label className="text-slate-200">Turma/Periodo</label>
              <input
                type="text"
                className="w-full mb-5 p-2 rounded"
                ref={turmaPeriodoRef}
                defaultValue={editingMaterial.turma_periodo}
              />

              <input
                type="submit"
                value={"Save Changes"}
                className="cursor-pointer w-full bg-slate-800 rounded font-medium text-slate-200 p-4"
              />
            </form>
          </section>
        )}
      </main>
    </div>
  );
}