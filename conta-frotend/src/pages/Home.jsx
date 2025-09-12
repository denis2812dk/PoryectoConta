export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
                <h1 className="text-3xl font-bold mb-2">📘 Sistema Contable</h1>
                <p className="text-gray-700">Bienvenido a tu mini Conta Portable.</p>

                <div className="mt-6 space-y-4">
                    <div>
                        <h3 className="font-semibold">Empresa</h3>
                        <p>Aplicación de Técnicas Contables</p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Integrantes</h3>
                        <ul className="list-disc pl-6">
                            <li>Balcaceres Silvestre, Luis Felipe</li>
                            <li>Chávez Solito, René David</li>
                            <li>Cruz Algarin, Katherinne Jeannette</li>
                            <li>Guevara Martinez, Dennis Ademir</li>
                            <li>Villeda Alabi, Mario Edgardo</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
