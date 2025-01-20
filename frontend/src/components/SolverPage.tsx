import { useNavigate } from 'react-router-dom';

const SolverPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            Welcome Solver
          </h1>
          <p className="mt-2 text-gray-400">
            Crypto to Fiat Interface - Seamlessly pay in local currency using your crypto assets
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Foreigner Card */}
          <div 
            onClick={() => navigate('/solver1')}
            className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="text-center">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white">Solver 1</h2>
              <p className="mt-2 text-gray-400">
                I'm Solver 1!
              </p>
            </div>
          </div>

          {/* Intent Solver Card */}
          <div 
            onClick={() => navigate('/solver2')}
            className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="text-center">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white">Solver 2</h2>
              <p className="mt-2 text-gray-400">
                I'm Solver 2!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolverPage;