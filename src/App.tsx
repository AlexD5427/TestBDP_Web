/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Applicant, AgencyStats } from './types';
import { INITIAL_APPLICANTS, AGENCY_STATS } from './data/mockApplicants';
import BackgroundBlobs from './components/BackgroundBlobs';
import CandidateTable from './components/CandidateTable';
import ChartsSection from './components/ChartsSection';
import CandidateModal from './components/CandidateModal';
import CompareSection from './components/CompareSection';
import CandidateForm from './components/CandidateForm';
import ProcessesSection from './components/ProcessesSection';
import CandidateProfileView from './components/CandidateProfileView';
import { BdpLogo } from './components/BdpLogo';
import { 
  Briefcase, Users, Award, Percent, Database, HelpCircle, 
  Sparkles, RefreshCw, Layers, ShieldCheck, Scale, CheckCircle,
  Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('candidate_dashboard_theme');
    return savedTheme !== 'light'; // default: true (dark)
  });
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [agencyStats, setAgencyStats] = useState<AgencyStats[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  
  // Modals & triggers states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState('');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'matrix' | 'compare' | 'processes'>('matrix');

  // Persistence: Initialize state from localStorage or default simulation
  useEffect(() => {
    const storedApplicants = localStorage.getItem('candidate_dashboard_applicants');
    const storedAgencies = localStorage.getItem('candidate_dashboard_agencies');

    if (storedApplicants && storedAgencies) {
      const parsedApplicants = JSON.parse(storedApplicants) as Applicant[];
      setApplicants(parsedApplicants);
      setAgencyStats(JSON.parse(storedAgencies) as AgencyStats[]);
      if (parsedApplicants.length > 0) {
        setSelectedApplicantId(parsedApplicants[0].id);
        setSelectedApplicant(parsedApplicants[0]);
      }
    } else {
      // Lazy load from default mockup
      setApplicants(INITIAL_APPLICANTS);
      setAgencyStats(AGENCY_STATS);
      localStorage.setItem('candidate_dashboard_applicants', JSON.stringify(INITIAL_APPLICANTS));
      localStorage.setItem('candidate_dashboard_agencies', JSON.stringify(AGENCY_STATS));
      
      if (INITIAL_APPLICANTS.length > 0) {
        setSelectedApplicantId(INITIAL_APPLICANTS[0].id);
        setSelectedApplicant(INITIAL_APPLICANTS[0]);
      }
    }
  }, []);

  // Sync selected candidate object when applicants change or selection ID changes
  useEffect(() => {
    if (selectedApplicantId) {
      const match = applicants.find(a => a.id === selectedApplicantId);
      if (match) {
        setSelectedApplicant(match);
      } else if (applicants.length > 0) {
        setSelectedApplicantId(applicants[0].id);
        setSelectedApplicant(applicants[0]);
      } else {
        setSelectedApplicant(null);
      }
    } else if (applicants.length > 0) {
      setSelectedApplicantId(applicants[0].id);
      setSelectedApplicant(applicants[0]);
    } else {
      setSelectedApplicant(null);
    }
  }, [selectedApplicantId, applicants]);

  // Persist State Helper
  const saveAndSetApplicants = (newApplicants: Applicant[]) => {
    setApplicants(newApplicants);
    localStorage.setItem('candidate_dashboard_applicants', JSON.stringify(newApplicants));
  };

  // 1. Interactive Extraction simulator - Extract database
  const handleExtractDatabase = () => {
    setIsExtracting(true);
    setExtractionStatus('Estableciendo conexión inicial con la instancia de nube segura...');
    
    // Staggered logs for full simulator visual fidelity
    const logs = [
      'Autenticando certificados del servidor...',
      'Conexión exitosa. Extrayendo esquema de indicadores de candidatos...',
      'Mapeando métricas de calificación técnica e historial de eventos...',
      '¡Extracción exitosa! Registros combinados con métricas actualizadas de la agencia (latencia: 28 ms).'
    ];

    logs.forEach((logText, idx) => {
      setTimeout(() => {
        setExtractionStatus(logText);
        if (idx === logs.length - 1) {
          setIsExtracting(false);
          // Overwrite local records with pristine backend default setup
          saveAndSetApplicants(INITIAL_APPLICANTS);
          setAgencyStats(AGENCY_STATS);
          localStorage.setItem('candidate_dashboard_agencies', JSON.stringify(AGENCY_STATS));
          
          if (INITIAL_APPLICANTS.length > 0) {
            setSelectedApplicantId(INITIAL_APPLICANTS[0].id);
          }
          // Remove extraction banner after timeout
          setTimeout(() => setExtractionStatus(''), 5000);
        }
      }, (idx + 1) * 900);
    });
  };

  // 2. Select Applicant trigger
  const handleSelectApplicant = (id: string) => {
    setSelectedApplicantId(id);
  };

  // 3. Edit Applicant - opens slider modal
  const handleEditApplicantTrigger = (app: Applicant) => {
    setEditingApplicant(app);
    setIsFormOpen(true);
  };

  // 4. Submit Add or Edit
  const handleFormSubmit = (submittedApp: Applicant) => {
    let updatedApplicantsList: Applicant[];

    if (editingApplicant) {
      // Editing existing records
      updatedApplicantsList = applicants.map(a => a.id === submittedApp.id ? submittedApp : a);
    } else {
      // Adding completely new records
      updatedApplicantsList = [submittedApp, ...applicants];
      setSelectedApplicantId(submittedApp.id);
    }

    saveAndSetApplicants(updatedApplicantsList);
    
    // Re-calculate dynamic stats based on new data
    recalculateAgencyStats(updatedApplicantsList);

    setIsFormOpen(false);
    setEditingApplicant(null);
  };

  // Recalculates Agency KPIs to respond in real-time to tweaks or custom records additions
  const recalculateAgencyStats = (currentApps: Applicant[]) => {
    const freshStats: AgencyStats[] = AGENCY_STATS.map(stat => {
      const agencyApps = currentApps.filter(a => a.agency === stat.agencyName);
      if (agencyApps.length === 0) return { ...stat, totalApplicants: 0, averageScore: 0 };
      
      const sumScores = agencyApps.reduce((acc, app) => {
        const { technical, communication, leadership, cultureFit, experience, problemSolving } = app.metrics;
        return acc + ((technical + communication + leadership + cultureFit + experience + problemSolving) / 6);
      }, 0);
      
      const totalRejected = agencyApps.filter(a => a.status === 'Rejected').length;
      const totalOffered = agencyApps.filter(a => a.status === 'Offered' || a.status === 'Shortlisted').length;

      return {
        agencyName: stat.agencyName,
        totalApplicants: agencyApps.length + 5, // offset to reflect wider db records
        averageScore: Math.round(sumScores / agencyApps.length),
        rejectionRate: Math.round((totalRejected / agencyApps.length) * 30), // weighted curve
        placementRate: Math.round((totalOffered / agencyApps.length) * 55)
      };
    });

    setAgencyStats(freshStats);
    localStorage.setItem('candidate_dashboard_agencies', JSON.stringify(freshStats));
  };

  // 5. Delete/Archive Applicant record
  const handleDeleteApplicant = (id: string) => {
    const updated = applicants.filter(a => a.id !== id);
    saveAndSetApplicants(updated);
    if (selectedApplicantId === id && updated.length > 0) {
      setSelectedApplicantId(updated[0].id);
    }
  };

  // 6. Direct fast inline update (e.g. from Detail panel Notes/Status adjusts)
  const handleUpdateApplicantDirectly = (updatedApp: Applicant) => {
    const list = applicants.map(a => a.id === updatedApp.id ? updatedApp : a);
    saveAndSetApplicants(list);
    recalculateAgencyStats(list);
  };

  // High-level metadata calculators
  const totalProfiles = applicants.length;
  const interviewingVolume = applicants.filter(a => a.status === 'Interviewing' || a.status === 'Shortlisted').length;
  const averageCohortScore = Math.round(
    applicants.reduce((acc, app) => {
      const { technical, communication, leadership, cultureFit, experience, problemSolving } = app.metrics;
      return acc + ((technical + communication + leadership + cultureFit + experience + problemSolving) / 6);
    }, 0) / (applicants.length || 1)
  );

  return (
    <div className={`min-h-screen font-sans pb-16 antialiased transition-colors duration-500 ${
      isDarkMode ? 'text-slate-100 bg-slate-950' : 'text-slate-800 bg-[#f4f7fa]'
    }`}>
      {/* Background blobs for Liquid Glass canvas atmosphere */}
      <BackgroundBlobs isDarkMode={isDarkMode} />

      {/* Main glass frame wrapper */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
        {/* Navigation Header */}
        <header id="dashboard-navbar" className={`relative backdrop-blur-xl border rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md transition-all duration-300 ${
          isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/90 border-[#AAB9C2]/40 shadow-[0_8px_30px_rgba(0,74,143,0.05)] text-slate-800'
        }`}>
          <div className="flex items-center flex-wrap gap-4">
            <BdpLogo className="h-12 w-auto" isDarkMode={isDarkMode} />
            <div className="h-8 w-[1px] bg-[#AAB9C2]/30 hidden md:block" />
            <div className="leading-tight">
              <h1 id="dashboard-title" className={`text-sm sm:text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#004a8f]'}`}>
                Banco de Desarrollo Productivo S.A.M.
              </h1>
              <p className={`text-[10px] sm:text-[11px] font-mono mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-[#647786]'}`}>
                Sistema interno de Selección y Reclutamiento v1.0
              </p>
            </div>
          </div>

          {/* Quick Stats Grid inside navbar */}
          <div className={`flex items-center gap-5 sm:gap-6 font-mono text-[11px] ${isDarkMode ? 'text-slate-100' : 'text-[#647786]'}`}>
            <div className="text-center">
              <p className="text-slate-400 font-normal">ESTADO SINC.</p>
              <p className="font-bold text-[#00AB4E] flex items-center justify-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Activo
              </p>
            </div>
            <div className={`h-6 w-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-[#AAB9C2]/40'}`} />
            <div className="text-center">
              <p className="text-slate-400 font-normal">PROMEDIO GRUPAL</p>
              <p className={`font-bold mt-0.5 ${isDarkMode ? 'text-cyan-300' : 'text-[#004a8f]'}`}>{averageCohortScore}% prom</p>
            </div>
            <div className={`h-6 w-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-[#AAB9C2]/40'}`} />
            <div className="text-center">
              <p className="text-slate-400 font-normal font-mono">BASE DE DATOS</p>
              <button 
                onClick={handleExtractDatabase}
                className="cursor-pointer text-[#005baa] hover:text-[#004a8f] font-bold underline transition-colors flex items-center justify-center gap-0.5 mt-0.5"
              >
                <Database className="w-3 h-3" /> Reiniciar BD
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard KPIs Cards Row */}
        <div id="kpis-summary-row" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1 */}
          <div className={`backdrop-blur-xl border rounded-2xl p-4.5 flex items-center gap-4 shadow-sm transition-all duration-300 ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/95 border-[#AAB9C2]/30 shadow-[0_8px_30px_rgba(15,23,42,0.02)]'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-[#00b0d8]/10 border-[#00b0d8]/30 text-[#004a8f]'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Perfiles Sincronizados</p>
              <p className={`text-xl font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalProfiles}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`backdrop-blur-xl border rounded-2xl p-4.5 flex items-center gap-4 shadow-sm transition-all duration-300 ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/95 border-[#AAB9C2]/30 shadow-[0_8px_30px_rgba(15,23,42,0.02)]'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDarkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-250 text-purple-700'
            }`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Entrevistas Activas</p>
              <p className={`text-xl font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{interviewingVolume}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`backdrop-blur-xl border rounded-2xl p-4.5 flex items-center gap-4 shadow-sm transition-all duration-300 ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/95 border-[#AAB9C2]/30 shadow-[0_8px_30px_rgba(15,23,42,0.02)]'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-55 bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}>
              <Award className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Promedio de Calificación</p>
              <p className={`text-xl font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{averageCohortScore}%</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`backdrop-blur-xl border rounded-2xl p-4.5 flex items-center gap-4 shadow-sm transition-all duration-300 ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/95 border-[#AAB9C2]/30 shadow-[0_8px_30px_rgba(15,23,42,0.02)]'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-10 border-[#00AB4E]/30 text-[#00AB4E]'
            }`}>
              <Percent className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Fuente Principal</p>
              <p className={`text-sm font-semibold mt-1.5 truncate max-w-[120px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`} title="Nexus Talent">
                Nexus Talent
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Layout Switcher (Candidate Portal vs Compare Sandbox) */}
        <div className={`flex border-b pb-1 mb-6 gap-6 ${isDarkMode ? 'border-white/10' : 'border-[#AAB9C2]/40'}`}>
          <button
            onClick={() => setActiveWorkspaceTab('matrix')}
            className={`cursor-pointer text-sm font-medium pb-2 relative transition-all flex items-center gap-2 ${
              activeWorkspaceTab === 'matrix' 
                ? isDarkMode 
                  ? 'text-white border-b-2 border-b-cyan-405 border-b-[#00b0d8] font-semibold' 
                  : 'text-[#004a8f] border-b-2 border-b-[#004a8f] font-bold'
                : 'text-slate-400 hover:text-[#005baa]'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeWorkspaceTab === 'matrix' ? 'text-[#004a8f]' : 'text-slate-400'}`} />
            Tablero de Evaluación
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('compare')}
            className={`cursor-pointer text-sm font-medium pb-2 relative transition-all flex items-center gap-2 ${
              activeWorkspaceTab === 'compare' 
                ? isDarkMode 
                  ? 'text-white border-b-2 border-b-[#005baa] font-semibold' 
                  : 'text-[#005baa] border-b-2 border-b-[#005baa] font-bold'
                : 'text-slate-400 hover:text-[#005baa]'
            }`}
          >
            <Scale className={`w-4 h-4 ${activeWorkspaceTab === 'compare' ? 'text-[#005baa]' : 'text-slate-400'}`} />
            Comparación Cara a Cara
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('processes')}
            className={`cursor-pointer text-sm font-medium pb-2 relative transition-all flex items-center gap-2 ${
              activeWorkspaceTab === 'processes' 
                ? isDarkMode 
                  ? 'text-white border-b-2 border-b-[#00AB4E] font-semibold' 
                  : 'text-[#00AB4E] border-b-2 border-b-[#00AB4E] font-bold'
                : 'text-slate-400 hover:text-[#00AB4E]'
            }`}
          >
            <Briefcase className={`w-4 h-4 ${activeWorkspaceTab === 'processes' ? 'text-[#00AB4E]' : 'text-slate-400'}`} />
            Procesos
          </button>
        </div>

        {/* Dynamic Views Panel */}
        <AnimatePresence mode="wait">
          {activeWorkspaceTab === 'matrix' && (
            <motion.div
              key="matrix"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Candidates list portal & extraction logs (8 sections) */}
              <div className="lg:col-span-8 space-y-8">
                <CandidateTable
                  applicants={applicants}
                  selectedApplicantId={selectedApplicantId}
                  onSelectApplicant={handleSelectApplicant}
                  onEditApplicant={handleEditApplicantTrigger}
                  onDeleteApplicant={handleDeleteApplicant}
                  onAddApplicantTrigger={() => {
                    setEditingApplicant(null);
                    setIsFormOpen(true);
                  }}
                  onExtractDBTrigger={handleExtractDatabase}
                  extractionStatus={extractionStatus}
                  isExtracting={isExtracting}
                  isDarkMode={isDarkMode}
                />

                {/* Qualification metrics overall analytical graph */}
                <ChartsSection
                  selectedApplicant={selectedApplicant}
                  allApplicants={applicants}
                  agencyStats={agencyStats}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Right Column: Active candidate deep modal / scorecard (4 sections) */}
              <div className="lg:col-span-4 lg:sticky lg:top-8">
                {selectedApplicant ? (
                  <CandidateModal
                    applicant={selectedApplicant}
                    onClose={() => setSelectedApplicantId(null)}
                    onUpdateApplicant={handleUpdateApplicantDirectly}
                    isDarkMode={isDarkMode}
                  />
                ) : (
                  <div className={`backdrop-blur-xl border rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white/70 border-slate-200/85 text-slate-500'
                  }`}>
                    <HelpCircle className="w-10 h-10 text-slate-400 mb-3 animate-pulse" />
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Espacio de Trabajo Inactivo</p>
                    <p className={`text-xs mt-1.5 max-w-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Selecciona un perfil de la lista de la izquierda para ver el desglose completo de sus métricas de calificación, línea de tiempo e historial de revisiones.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeWorkspaceTab === 'compare' && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <CompareSection applicants={applicants} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeWorkspaceTab === 'processes' && (
            <motion.div
              key="processes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <ProcessesSection 
                applicants={applicants}
                onUpdateApplicant={handleUpdateApplicantDirectly}
                isDarkMode={isDarkMode}
                onSelectApplicantInDashboard={(id) => {
                  setSelectedApplicantId(id);
                  setActiveWorkspaceTab('matrix');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide sheet Slider Qualification/Add Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <CandidateForm
            onClose={() => {
              setIsFormOpen(false);
              setEditingApplicant(null);
            }}
            onSubmit={handleFormSubmit}
            applicantToEdit={editingApplicant}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      {/* Theme switcher floating action button at bottom-right corner with animation */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="theme-switcher-btn"
          onClick={() => {
            const nextMode = !isDarkMode;
            setIsDarkMode(nextMode);
            localStorage.setItem('candidate_dashboard_theme', nextMode ? 'dark' : 'light');
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            rotate: isDarkMode ? 360 : 0,
          }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className={`p-3.5 rounded-full border shadow-lg flex items-center justify-center transition-colors backdrop-blur-md cursor-pointer ${
            isDarkMode 
              ? 'bg-slate-900/90 border-cyan-500/30 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800' 
              : 'bg-white/90 border-slate-200 text-amber-500 hover:text-amber-600 hover:bg-slate-100 shadow-[0_8px_30px_rgba(245,158,11,0.25)]'
          }`}
          title={isDarkMode ? "Cambiar a Tema Claro" : "Cambiar a Tema Oscuro"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDarkMode ? (
              <motion.div
                key="moon-icon"
                initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
                transition={{ duration: 0.25 }}
              >
                <Moon className="w-5 h-5 fill-cyan-400/10" />
              </motion.div>
            ) : (
              <motion.div
                key="sun-icon"
                initial={{ opacity: 0, scale: 0.6, rotate: 45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: -45 }}
                transition={{ duration: 0.25 }}
              >
                <Sun className="w-5 h-5 fill-amber-500/10" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
