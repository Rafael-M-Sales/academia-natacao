import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveSync } from './useLiveSync';
import * as api from '../services/api';
import {
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  PRESENCE_HISTORY,
  INITIAL_EMPLOYEES,
  EMPLOYEE_PRESENCE,
} from '../data/mockData';
import { loadDemoState, saveDemoState } from '../utils/demoStorage';
import { DEMO_MODE } from '../config';

export function useAcademyData() {
  const { isAuthenticated, demoMode } = useAuth();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [presenceHistory, setPresenceHistory] = useState(PRESENCE_HISTORY);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [employeePresence, setEmployeePresence] = useState(EMPLOYEE_PRESENCE);
  const [liveSessions, setLiveSessions] = useState([]);
  const [pedagogyNotes, setPedagogyNotes] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [filterPendingMedicalFromDash, setFilterPendingMedicalFromDash] = useState(false);
  const [isProfessor, setIsProfessor] = useState(window.location.hash === '#professor');
  const skipSaveRef = useRef(true);

  useEffect(() => {
    const onHashChange = () => setIsProfessor(window.location.hash === '#professor');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const applyLivePayload = useCallback((payload) => {
    if (payload.students) setStudents(payload.students);
    if (payload.classes) setClasses(payload.classes);
    if (payload.presenceHistory) setPresenceHistory(payload.presenceHistory);
    if (payload.liveSessions) setLiveSessions(payload.liveSessions);
    if (payload.pedagogyNotes) setPedagogyNotes(payload.pedagogyNotes);
  }, []);

  useLiveSync(isAuthenticated && apiConnected && !demoMode && !DEMO_MODE, applyLivePayload);

  useEffect(() => {
    if (!isAuthenticated || isProfessor) return;

    if (demoMode || DEMO_MODE) {
      const saved = loadDemoState();
      if (saved) {
        if (saved.students) setStudents(saved.students);
        if (saved.classes) setClasses(saved.classes);
        if (saved.presenceHistory) setPresenceHistory(saved.presenceHistory);
        if (saved.employees) setEmployees(saved.employees);
        if (saved.employeePresence) setEmployeePresence(saved.employeePresence);
      }
      setDataLoading(false);
      setApiConnected(false);
      skipSaveRef.current = false;
      return;
    }

    let cancelled = false;
    (async () => {
      setDataLoading(true);
      skipSaveRef.current = true;
      try {
        const data = await api.fetchAcademyData();
        if (cancelled) return;
        setStudents(data.students);
        setClasses(data.classes);
        setPresenceHistory(data.presenceHistory);
        setEmployees(data.employees);
        setEmployeePresence(data.employeePresence);
        setLiveSessions(data.liveSessions || []);
        setPedagogyNotes(data.pedagogyNotes || []);
        setApiConnected(true);
      } catch {
        setApiConnected(false);
      } finally {
        if (!cancelled) {
          setDataLoading(false);
          setTimeout(() => { skipSaveRef.current = false; }, 100);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, demoMode, isProfessor]);

  useEffect(() => {
    if (demoMode || DEMO_MODE || !isAuthenticated || dataLoading || !apiConnected || skipSaveRef.current) return;

    const timer = setTimeout(() => {
      api.saveAcademyData({
        students, classes, presenceHistory, employees, employeePresence, liveSessions, pedagogyNotes,
      }).catch(() => setApiConnected(false));
    }, 800);

    return () => clearTimeout(timer);
  }, [students, classes, presenceHistory, employees, employeePresence, liveSessions, pedagogyNotes, isAuthenticated, dataLoading, apiConnected, demoMode]);

  useEffect(() => {
    if (!isAuthenticated || (!demoMode && !DEMO_MODE) || dataLoading) return;
    const timer = setTimeout(() => {
      saveDemoState({ students, classes, presenceHistory, employees, employeePresence });
    }, 500);
    return () => clearTimeout(timer);
  }, [students, classes, presenceHistory, employees, employeePresence, isAuthenticated, demoMode, dataLoading]);

  return {
    students, setStudents,
    classes, setClasses,
    presenceHistory, setPresenceHistory,
    employees, setEmployees,
    employeePresence, setEmployeePresence,
    liveSessions, setLiveSessions,
    pedagogyNotes, setPedagogyNotes,
    dataLoading, apiConnected,
    filterPendingMedicalFromDash, setFilterPendingMedicalFromDash,
    isProfessor,
  };
}
