"use client"
import { useEffect, useState, useRef, FormEvent } from "react";
import { FiTrash, FiEdit, FiCheck } from "react-icons/fi";
import { api } from "../api";
import { AxiosError } from "axios"; // Importa AxiosError

interface PagamentoProps {
  id: string;
  valorTotal: number; // Aqui agora o valorTotal é um número
  dataHoraPagamento: string;
  statusPagamento: boolean;
  meioPagamento: string;
  valores_id: string;
}

export default function Pagamento() {
  const valorTotalRef = useRef<HTMLInputElement | null>(null);
  const meioPagamentoRef = useRef<HTMLSelectElement | null>(null);
  const valores_idRef = useRef<HTMLInputElement | null>(null);

  const [pagamentos, setPagamento] = useState<PagamentoProps[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<PagamentoProps>>({});

  useEffect(() => {
    readPagamento();
  }, []);

  async function readPagamento() {
    try {
      const response = await api.get("/pagamentos");
      setPagamento(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching pagamentos:", error);
      setPagamento([]);
    }
  }

  async function createPagamento(event: FormEvent) {
    event.preventDefault();
    try {
      const meioPagamentoValue = meioPagamentoRef.current?.value as "Cartão" | "Dinheiro" | "Pix";
      const valoresIdValue = valores_idRef.current?.value;

      // Validação do valorTotal para garantir que é um número positivo
      const valorTotalValue = parseFloat(valorTotalRef.current?.value || "0");
      if (isNaN(valorTotalValue) || valorTotalValue <= 0) {
        alert("Invalid valorTotal. It must be a positive number.");
        return;
      }

      const response = await api.post("/pagamentos", {
        valorTotal: valorTotalValue, // Agora passa como número
        meioPagamento: meioPagamentoValue,
        valores_id: valoresIdValue
      });

      setPagamento(allPagamento => [...allPagamento, response.data]);
    } catch (error) {
      if (error instanceof AxiosError) { // Verifica se o erro é um AxiosError
        if (error.response) {
          const { status, data } = error.response;
          console.error(`Erro ${status}:`, data);
          alert(`Ocorreu um erro ${status}: ${data.message || "por favor, tente novamente."}`);
        } else {
          console.error("Erro Axios:", error.message);
          alert("Ocorreu um erro na requisição, por favor, tente novamente.");
        }
      } else {
        console.error("Erro desconhecido:", error);
        alert("Ocorreu um erro inesperado.");
      }
    }
  }

  function startEditing(pagamento: PagamentoProps) {
    setEditingId(pagamento.id);
    setEditValues(pagamento);
  }

  async function updatePagamento(id: string) {
    try {
      await api.put("/pagamentos/" + id, editValues);
      setEditingId(null);
      setEditValues({});
      readPagamento();
    } catch (error) {
      console.error("Error updating pagamentos:", error);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function deletePagamento(id: string) {
    try {
      await api.delete("/pagamentos/" + id);
      const allPagamento = pagamentos.filter((pagamento) => pagamento.id !== id);
      setPagamento(allPagamento);
    } catch (err) {
      alert(err);
    }
  }

  async function setPagamentoDone(id: string) {
    try {
      await api.put("/pagamentos/" + id, {
        statusPagamento: true,
      });
      const response = await api.get("/pagamentos");
      setPagamento(response.data);
    } catch (err) {
      alert(err);
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-500 flex justify-center px-4">
      <main className="my-10 w-full lg:max-w-5xl">
        <section>
          <h1 className="text-4xl text-slate-200 font-medium text-center">Pagamentos</h1>

          <form className="flex flex-col my-6" onSubmit={createPagamento}>
            <label className="text-slate-200">Valor total do pagamento:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={valorTotalRef} />
            <label className="text-slate-200">Meio de Pagamento:</label>
            <select ref={meioPagamentoRef} className="w-full mb-5 p-2 rounded">
              <option value="Cartão">Cartão</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Pix">Pix</option>
            </select>
            <label className="text-slate-200">ID de valores:</label>
            <input type="text" className="w-full mb-5 p-2 rounded" ref={valores_idRef} />
            <input type="submit" value={"Adicionar Pagamento"} className="cursor-pointer w-full bg-slate-800 rounded font-medium text-slate-200 p-4" />
          </form>
        </section>
        <section className="mt-5 flex flex-col">
          {pagamentos.length > 0 ? (
            pagamentos.map((pagamento) => (
              <article className="w-full bg-slate-200 text-slate-800 p-2 mb-4 rounded relative hover:bg-sky-300" key={pagamento.id}>
                {editingId === pagamento.id ? (
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        name="statusPagamento"
                        checked={editValues.statusPagamento || false}
                        onChange={handleInputChange}
                      />
                      Efetuado
                    </label>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => updatePagamento(pagamento.id)}>Salvar</button>
                  </div>
                ) : (
                  <div>
                    <p>{pagamento.valorTotal}</p>
                    <p>{pagamento.meioPagamento}</p>
                    <p>{new Date(pagamento.dataHoraPagamento).toLocaleDateString()}</p>
                    <p>Ativo: {pagamento.statusPagamento.toString()}</p>
                    <button className="flex absolute right-20 -top-2 bg-yellow-500 w-7 h-7 items-center justify-center text-slate-200" onClick={() => startEditing(pagamento)}>
                      <FiEdit />
                    </button>
                    <button className="flex absolute right-10 -top-2 bg-green-600 w-7 h-7 items-center justify-center text-slate-200" onClick={() => setPagamentoDone(pagamento.id)}>
                      <FiCheck />
                    </button>
                  </div>
                )}
                <button className="flex absolute right-0 -top-2 bg-red-600 w-7 h-7 items-center justify-center text-slate-200" onClick={() => deletePagamento(pagamento.id)}>
                  <FiTrash />
                </button>
              </article>
            ))
          ) : (
            <p className="text-center text-gray-500">No pagamentos available</p>
          )}
        </section>
      </main>
    </div>
  );
}
