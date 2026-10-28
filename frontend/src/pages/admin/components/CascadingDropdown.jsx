import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';

const defaultSemesters = [
  "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
  "5th Semester", "6th Semester", "7th Semester", "8th Semester"
];

const defaultSections = [
  "Section A", "Section B", "Section C", "Section D", "General Section"
];

const CascadingDropdown = ({ onSelectionComplete }) => {
  const [hierarchies, setHierarchies] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchHierarchies();
  }, []);

  const fetchHierarchies = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data.success) {
        setHierarchies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching hierarchies', err);
    }
  };

  const getDept = () => hierarchies.find(d => d._id === selectedDept) || {};
  const getCourse = () => getDept().courses?.find(c => c._id === selectedCourse || c.name === selectedCourse) || {};
  const getBranch = () => getCourse().branches?.find(b => b._id === selectedBranch || b.name === selectedBranch) || {};
  const getSession = () => getBranch().sessions?.find(s => s._id === selectedSession || s.name === selectedSession) || {};
  
  const sessionSemesters = getSession().semesters && getSession().semesters.length > 0 
    ? getSession().semesters.map(s => s.name) 
    : defaultSemesters;

  const getSemester = () => getSession().semesters?.find(s => s._id === selectedSemester || s.name === selectedSemester) || {};
  
  const semesterSections = getSemester()?.sections && getSemester().sections.length > 0
    ? getSemester().sections.map(s => s.name)
    : defaultSections;

  useEffect(() => {
    if (selectedDept && selectedCourse && selectedBranch && selectedSession) {
      onSelectionComplete({
        department: getDept().name || '',
        course: getCourse().name || '',
        branch: getBranch().name || '',
        session: getSession().name || '',
        semester: selectedSemester || '',
        section: selectedSection || '',
        subjects: getSemester()?.sections?.find(s => s.name === selectedSection)?.subjects || []
      });
    }
  }, [selectedDept, selectedCourse, selectedBranch, selectedSession, selectedSemester, selectedSection]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div>
        <label className="block text-sm font-medium mb-1">Department</label>
        <select 
          className="w-full p-2 border rounded" 
          value={selectedDept} 
          onChange={(e) => { setSelectedDept(e.target.value); setSelectedCourse(''); setSelectedBranch(''); setSelectedSession(''); setSelectedSemester(''); setSelectedSection(''); }}
        >
          <option value="">Select Department</option>
          {hierarchies.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Course</label>
        <select 
          className="w-full p-2 border rounded" 
          value={selectedCourse} 
          onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBranch(''); setSelectedSession(''); setSelectedSemester(''); setSelectedSection(''); }}
          disabled={!selectedDept}
        >
          <option value="">Select Course</option>
          {getDept().courses?.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Branch</label>
        <select 
          className="w-full p-2 border rounded" 
          value={selectedBranch} 
          onChange={(e) => { setSelectedBranch(e.target.value); setSelectedSession(''); setSelectedSemester(''); setSelectedSection(''); }}
          disabled={!selectedCourse}
        >
          <option value="">Select Branch</option>
          {getCourse().branches?.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Session</label>
        <select 
          className="w-full p-2 border rounded" 
          value={selectedSession} 
          onChange={(e) => { setSelectedSession(e.target.value); setSelectedSemester(''); setSelectedSection(''); }}
          disabled={!selectedBranch}
        >
          <option value="">Select Session</option>
          {getBranch().sessions?.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Semester (Optional)</label>
        <select 
          className="w-full p-2 border rounded" 
          value={selectedSemester} 
          onChange={(e) => { setSelectedSemester(e.target.value); setSelectedSection(''); }}
          disabled={!selectedSession}
        >
          <option value="">All Semesters</option>
          {sessionSemesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Section (Optional)</label>
        <select 
          className="w-full p-2 border rounded" 
          value={selectedSection} 
          onChange={(e) => { setSelectedSection(e.target.value); }}
          disabled={!selectedSemester}
        >
          <option value="">All Sections</option>
          {semesterSections.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
};

export default CascadingDropdown;
