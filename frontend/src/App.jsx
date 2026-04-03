import React, { useState } from 'react';

function App() {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('5432');
  const [user, setUser] = useState('bocauser');
  const [password, setPassword] = useState('password123'); // docker-compose tiene otra, pero para demo
  const [pattern, setPattern] = useState('rpc_YYYY_CC');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // SQL Query States
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  const [logs, setLogs] = useState([
    {
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      level: 'INFO',
      message: 'System ready. Waiting for connection parameters...',
      color: 'text-white/70'
    }
  ]);

  const addLog = (level, message, color) => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      level,
      message,
      color
    }]);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsConnecting(true);
    addLog('INFO', `Initializing handshake with ${host}...`, 'text-white/70');

    try {
      // Ignoramos 'pattern' por el momento como se indicó
      const response = await fetch('http://localhost:3001/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, user, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addLog('SUCCESS', `TLS 1.3 encrypted tunnel established.`, 'text-cyan-400');
        addLog('SUCCESS', data.message, 'text-cyan-400');
      } else {
        addLog('ERROR', data.message || data.error, 'text-red-400');
      }
    } catch (error) {
      addLog('ERROR', `Connection failed: ${error.message} - Asegúrate de que el backend intermedio esté corriendo`, 'text-red-400');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);
    addLog('INFO', `Ejecutando query: ${query.substring(0, 30)}...`, 'text-white/70');

    try {
      const response = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, user, password, query })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addLog('SUCCESS', `Consulta completada: ${data.rowCount} filas afectadas.`, 'text-cyan-400');
        setQueryResult(data);
      } else {
        addLog('ERROR', data.error || data.message || 'Error desconocido ejecutando consulta', 'text-red-400');
        setQueryResult({ error: data.error || data.message });
      }
    } catch (error) {
      addLog('ERROR', `Error de red al ejecutar consulta: ${error.message}`, 'text-red-400');
      setQueryResult({ error: `Connection failed: ${error.message}` });
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <>
      {/* SideNavBar */}
      <aside className="h-screen w-60 fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col py-6 z-40">
        <div className="px-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                alt="RPC Logo" 
                className="w-full h-full object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AG5f3PzKj_vS6mXjB6Z8fR7yI9Y3Z9O6z7T7hQ9qQ-mS2uG8E1G1m-R_wJ2zS8W8O=s120"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">RPC SocialStream</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">ADMIN CONSOLE</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-4 px-6 py-3 text-slate-500 hover:text-primary transition-colors" href="#">
            <span className="material-symbols-outlined text-[22px]">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-4 px-6 py-3 text-primary bg-slate-50 active-nav-border transition-colors" href="#">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
            <span className="text-sm font-semibold">Conexión</span>
          </a>
          <a className="flex items-center gap-4 px-6 py-3 text-slate-500 hover:text-primary transition-colors" href="#">
            <span className="material-symbols-outlined text-[22px]">auto_videocam</span>
            <span className="text-sm font-medium leading-tight">Renderizado y publicación</span>
          </a>
        </nav>
        
        <div className="px-4">
          <button className="w-full py-2.5 px-4 bg-error-container text-on-error-container rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-200 transition-colors">
            <span className="material-symbols-outlined text-sm">emergency_home</span>
            Parada de Emergencia
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 w-[calc(100%-15rem)] z-50 bg-white border-b border-slate-100 flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-4">
          <span className="text-base font-bold text-primary">RPC Automatización</span>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <span className="text-primary text-sm font-medium">Competición activa: 02 - 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-100 rounded-full">
            <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full"></span>
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wide">PROCESO DEL SÁBADO: ACTIVO</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button className="material-symbols-outlined text-[22px] hover:text-slate-600">notifications</button>
            <button className="material-symbols-outlined text-[22px] hover:text-slate-600">settings</button>
            <div className="w-8 h-8 rounded overflow-hidden">
              <img 
                alt="Admin Avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoggnBZkXjfQ8lqjr57iw4u2H5AIo_Wb72KPpW-1m17v9OUS0Gu9dTViB6B3QDDA0u3E53Dj_JDsbLXPMdJwBQRa_gYs-zUExvVPZ44YCNqcBY7UFKh4zmbrvs3_20NLDxwanmisef8heyFutaoGwlmboqMvxQ9iXngKG24qnBEuhlimHafKiVDAT8TjcPHGoNdRpEzTzUbzHaf91zWpa9wOCSEVwRJ8X7uFu3QZ6QUikXyFIvY4hnWJBnSoNc66hVNgwlrABaKTvl"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-60 pt-24 p-10 pb-20 min-h-screen bg-slate-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Configuración del conector BOCA</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
              Establecer una interfaz segura con el motor de la base de datos de la competición. Configurar las credenciales de red y validar los patrones de detección de los clústeres activos de la competición.
            </p>
          </div>

          {/* Connection Settings Card */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 mb-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Parámetros de conexión</h3>
            </div>
            
            <form className="space-y-6" onSubmit={handleConnect}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SERVER HOST</label>
                  <input 
                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20" 
                    type="text" 
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NETWORK PORT</label>
                  <input 
                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20" 
                    type="text" 
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DATABASE USERNAME</label>
                  <input 
                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20" 
                    type="text" 
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ADMIN PASSWORD</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 pr-12" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DISCOVERY PATTERN</label>
                  <div className="flex items-center gap-3">
                    <input 
                      className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-3 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-primary/20" 
                      type="text" 
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                    />
                    <div className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 cursor-help">
                      <span className="material-symbols-outlined text-lg">help</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-800 transition-colors flex justify-center items-center gap-2" 
                  type="submit"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      Conectando...
                      <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                    </>
                  ) : "Guardar configuración"}
                </button>
              </div>
            </form>
          </div>

          {/* Terminal Log */}
          <div className="bg-terminal-bg rounded-lg p-6 font-mono text-[11px] border-l-[6px] border-cyan-400 min-h-[200px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-white uppercase tracking-widest opacity-80">CONFIGURATION TERMINAL LOG</span>
              <span className="text-[9px] text-white/30 tracking-tight">SYSTEM_HU1_DEBUG_SESSION</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
              {logs.map((log, index) => (
                <p key={index} className="text-terminal-text">
                  <span className="opacity-40">[{log.time}]</span>{' '}
                  <span className={`${log.color}`}>{log.level}:</span>{' '}
                  {log.message}
                </p>
              ))}
              {(isConnecting || isQuerying) && (
                <div className="inline-block w-2 h-4 bg-cyan-400/50 mt-1 align-middle animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Query Section */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 mt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Ejecutor de Consultas SQL</h3>
            </div>
            
            <form className="space-y-4" onSubmit={handleQuery}>
              <textarea
                className="w-full bg-slate-100 border-none rounded-lg px-4 py-4 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-primary/20 h-32 resize-y"
                placeholder="Escribe tu consulta SQL aquí (ej: SELECT * FROM information_schema.tables LIMIT 5)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-4">
                <button 
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-800 transition-colors flex items-center gap-2"
                  type="submit"
                  disabled={isQuerying}
                >
                  {isQuerying ? "Ejecutando..." : "Ejecutar Query"}
                </button>
              </div>
            </form>

            {/* Query Results */}
            {queryResult && (
              <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resultados</span>
                  {queryResult.rowCount !== undefined && (
                    <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded uppercase">{queryResult.rowCount} Filas</span>
                  )}
                </div>
                <div className="p-0 overflow-x-auto max-h-[400px] overflow-y-auto">
                  {queryResult.error ? (
                    <div className="p-4 bg-red-50 text-sm text-red-600 font-mono">
                      {queryResult.error}
                    </div>
                  ) : queryResult.rows && queryResult.rows.length > 0 ? (
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr>
                          {Object.keys(queryResult.rows[0]).map(key => (
                            <th key={key} className="p-3 border-b border-r border-slate-200 font-bold text-slate-700 bg-white sticky top-0 shadow-sm">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                            {Object.values(row).map((val, i) => (
                              <td key={i} className="p-3 border-r border-slate-100 text-slate-600 font-mono text-[13px] whitespace-nowrap">
                                {val !== null ? String(val) : <span className="text-slate-400 italic">null</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-sm text-slate-500 italic">
                      La consulta se ejecutó con éxito pero no devolvió filas.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}

export default App;
