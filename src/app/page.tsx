import { FiClipboard, FiBook, FiUsers , FiDollarSign, FiShoppingCart, FiCheckSquare, FiUserCheck} from "react-icons/fi";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-800 text-white flex flex-col">
      <header className="p-5 bg-opacity-20 backdrop-blur-md border-b border-white/10">
        <h1 className="text-3xl font-bold text-center">Copyfan</h1>
        <p className="text-center text-lg mt-2">Bem-vindo ao nosso aplicativo para a copiadora</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <Link
            href="/materiais"
            className="flex flex-col items-center p-6 bg-white/10 rounded-lg hover:scale-105 transition-transform"
          >
            <FiClipboard size={48} />
            <h2 className="text-xl font-bold mt-4">Materiais</h2>
            <p className="text-sm mt-2 text-center">Envie materiais para serem baixados de maneira eficiente.</p>
          </Link>
          <Link
            href="/cursos"
            className="flex flex-col items-center p-6 bg-white/10 rounded-lg hover:scale-105 transition-transform"
          >
            <FiBook size={48} />
            <h2 className="text-xl font-bold mt-4">Cursos</h2>
            <p className="text-sm mt-2 text-center">Lista de cursos do aplicativo.</p>
          </Link>
          <Link
            href="/perfis"
            className="flex flex-col items-center p-6 bg-white/10 rounded-lg hover:scale-105 transition-transform"
          >
            <FiUserCheck size={48} />
            <h2 className="text-xl font-bold mt-4">Perfis</h2>
            <p className="text-sm mt-2 text-center">Lista de perfis de usuários.</p>
          </Link>
          <Link
            href="/valores"
            className="flex flex-col items-center p-6 bg-white/10 rounded-lg hover:scale-105 transition-transform"
          >
            <FiCheckSquare size={48} />
            <h2 className="text-xl font-bold mt-4">Valores</h2>
            <p className="text-sm mt-2 text-center">Lista de valores.</p>
          </Link>
          <Link
            href="/pedidos"
            className="flex flex-col items-center p-6 bg-white/10 rounded-lg hover:scale-105 transition-transform"
          >
            <FiShoppingCart size={48} />
            <h2 className="text-xl font-bold mt-4">Pedidos</h2>
            <p className="text-sm mt-2 text-center">Lista de pedidos.</p>
          </Link>
          <Link
            href="/usuarios"
            className="flex flex-col items-center p-6 bg-white/10 rounded-lg hover:scale-105 transition-transform"
          >
            <FiUsers size={48} />
            <h2 className="text-xl font-bold mt-4">Usuarios</h2>
            <p className="text-sm mt-2 text-center">Lista de usuarios.</p>
          </Link>
          <Link
            href="/pagamentos"
            className="flex flex-col items-center p-6 bg-white/10 rounded-lg hover:scale-105 transition-transform"
          >
            <FiDollarSign size={48} />
            <h2 className="text-xl font-bold mt-4">Pagamentos</h2>
            <p className="text-sm mt-2 text-center">Lista de pagamentos.</p>
          </Link>
        </div>
      </main>

      <footer className="p-4 text-center bg-opacity-20 backdrop-blur-md border-t border-white/10">
        <p className="text-sm">© 2024 Copyfan - LightTech Ltda. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
