import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../../utils/api';
import InfoTooltip from '../../components/common/InfoTooltip';

const COURSE_TYPES = ['Major', 'Minor', 'Multidisciplinary', 'AEC', 'SEC', 'VAC'];
const SEMESTERS = [
  '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester'
];

const SubjectsManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedSemFilter, setSelectedSemFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null); // null for add, object for edit
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    departmentId: '',
    courseName: '',
    branchName: '',
    semesterName: '1st Semester',
    creditPoints: 4,
    theoryHours: 3,
    tutorialHours: 1,
    practicalHours: 0,
    courseType: 'Major',
    ncrfLevel: 'Level 6.0',
    learningOutcomes: ''
  });

  useEffect(() => {
    fetchHierarchies();
  }, []);

  const fetchHierarchies = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (error) {
      showToast('Failed to fetch academic subjects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract all subjects flattened with their hierarchy context
  const allSubjects = useMemo(() => {
    const list = [];
    departments.forEach((dept, dIdx) => {
      (dept.courses || []).forEach((course, cIdx) => {
        (course.branches || []).forEach((branch, bIdx) => {
          (branch.sessions || []).forEach((session, sIdx) => {
            // Subjects attached directly at Session level (if any)
            if (session.subjects && session.subjects.length > 0) {
              session.subjects.forEach((sub, subIdx) => {
                const subObj = typeof sub === 'string' ? { name: sub, code: '' } : sub;
                list.push({
                  id: `${dept._id}-${cIdx}-${bIdx}-${sIdx}-session-${subIdx}`,
                  ...subObj,
                  deptId: dept._id,
                  deptName: dept.name,
                  courseName: course.name,
                  branchName: branch.name,
                  sessionName: session.name,
                  semesterName: 'All Semesters',
                  locationType: 'session',
                  indices: [dIdx, cIdx, bIdx, sIdx, subIdx]
                });
              });
            }

            // Subjects attached at Semester level
            (session.semesters || []).forEach((sem, semIdx) => {
              if (sem.subjects && sem.subjects.length > 0) {
                sem.subjects.forEach((sub, subIdx) => {
                  const subObj = typeof sub === 'string' ? { name: sub, code: '' } : sub;
                  list.push({
                    id: `${dept._id}-${cIdx}-${bIdx}-${sIdx}-${semIdx}-${subIdx}`,
                    ...subObj,
                    deptId: dept._id,
                    deptName: dept.name,
                    courseName: course.name,
                    branchName: branch.name,
                    sessionName: session.name,
                    semesterName: sem.name,
                    locationType: 'semester',
                    indices: [dIdx, cIdx, bIdx, sIdx, semIdx, subIdx]
                  });
                });
              }

              // Subjects attached at Section level
              (sem.sections || []).forEach((sec, secIdx) => {
                (sec.subjects || []).forEach((sub, subIdx) => {
                  const subObj = typeof sub === 'string' ? { name: sub, code: '' } : sub;
                  list.push({
                    id: `${dept._id}-${cIdx}-${bIdx}-${sIdx}-${semIdx}-${secIdx}-${subIdx}`,
                    ...subObj,
                    deptId: dept._id,
                    deptName: dept.name,
                    courseName: course.name,
                    branchName: branch.name,
                    sessionName: session.name,
                    semesterName: sem.name,
                    sectionName: sec.name,
                    locationType: 'section',
                    indices: [dIdx, cIdx, bIdx, sIdx, semIdx, secIdx, subIdx]
                  });
                });
              });
            });
          });
        });
      });
    });
    return list;
  }, [departments]);

  // Unique lists for filters
  const uniqueCourses = useMemo(() => {
    const set = new Set();
    departments.forEach(d => (d.courses || []).forEach(c => set.add(c.name)));
    return Array.from(set);
  }, [departments]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return allSubjects.filter(sub => {
      const matchesSearch =
        searchTerm === '' ||
        (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.code && sub.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.courseName && sub.courseName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCourse = selectedCourseFilter === 'all' || sub.courseName === selectedCourseFilter;
      const matchesSem = selectedSemFilter === 'all' || sub.semesterName === selectedSemFilter;
      const matchesType = selectedTypeFilter === 'all' || (sub.courseType || 'Major') === selectedTypeFilter;

      return matchesSearch && matchesCourse && matchesSem && matchesType;
    });
  }, [allSubjects, searchTerm, selectedCourseFilter, selectedSemFilter, selectedTypeFilter]);

  // Handle Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSubject(null);
    const firstDept = departments[0];
    const firstCourse = firstDept?.courses?.[0];
    const firstBranch = firstCourse?.branches?.[0];

    setSubjectFormData({
      name: '',
      code: '',
      departmentId: firstDept?._id || '',
      courseName: firstCourse?.name || '',
      branchName: firstBranch?.name || '',
      semesterName: '1st Semester',
      creditPoints: 4,
      theoryHours: 3,
      tutorialHours: 1,
      practicalHours: 0,
      courseType: 'Major',
      ncrfLevel: 'Level 6.0',
      learningOutcomes: ''
    });
    setIsModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (sub) => {
    setEditingSubject(sub);
    setSubjectFormData({
      name: sub.name || '',
      code: sub.code || '',
      departmentId: sub.deptId,
      courseName: sub.courseName || '',
      branchName: sub.branchName || '',
      semesterName: sub.semesterName || '1st Semester',
      creditPoints: sub.creditPoints || 4,
      theoryHours: sub.creditHours?.theory ?? 3,
      tutorialHours: sub.creditHours?.tutorial ?? 1,
      practicalHours: sub.creditHours?.practical ?? 0,
      courseType: sub.courseType || 'Major',
      ncrfLevel: sub.ncrfLevel || 'Level 6.0',
      learningOutcomes: Array.isArray(sub.learningOutcomes) ? sub.learningOutcomes.join(', ') : (sub.learningOutcomes || '')
    });
    setIsModalOpen(true);
  };

  // Handle Submit (Add or Edit)
  const handleSubmitSubject = async (e) => {
    e.preventDefault();
    if (!subjectFormData.name.trim()) {
      showToast('Subject name is required', 'error');
      return;
    }

    showLoading(editingSubject ? 'Updating subject...' : 'Creating subject...');
    try {
      // Find the department to update
      const targetDeptId = subjectFormData.departmentId || departments[0]?._id;
      const dept = departments.find(d => String(d._id) === String(targetDeptId)) || departments[0];

      if (!dept) {
        showToast('Department not found. Create a department in Courses Hierarchy first.', 'error');
        hideLoading();
        return;
      }

      const updatedDept = JSON.parse(JSON.stringify(dept));
      if (!updatedDept.courses) updatedDept.courses = [];

      // Ensure course
      const courseName = subjectFormData.courseName || 'General Program';
      let course = updatedDept.courses.find(c => c.name === courseName);
      if (!course) {
        course = { name: courseName, branches: [] };
        updatedDept.courses.push(course);
      }
      if (!course.branches) course.branches = [];

      // Ensure branch
      const branchName = subjectFormData.branchName || 'General Branch';
      let branch = course.branches.find(b => b.name === branchName);
      if (!branch) {
        branch = { name: branchName, sessions: [] };
        course.branches.push(branch);
      }
      if (!branch.sessions) branch.sessions = [];

      // Ensure session (use current session 2026-27 or first existing)
      let session = branch.sessions[0];
      if (!session) {
        session = { name: '2026-27', semesters: [] };
        branch.sessions.push(session);
      }
      if (!session.semesters) session.semesters = [];

      // Ensure semester
      const semName = subjectFormData.semesterName || '1st Semester';
      let sem = session.semesters.find(s => s.name === semName);
      if (!sem) {
        sem = { name: semName, sections: [], subjects: [] };
        session.semesters.push(sem);
      }
      if (!sem.subjects) sem.subjects = [];

      const newSubjectItem = {
        name: subjectFormData.name.trim(),
        code: subjectFormData.code.trim().toUpperCase(),
        creditPoints: Number(subjectFormData.creditPoints) || 4,
        creditHours: {
          theory: Number(subjectFormData.theoryHours) || 0,
          tutorial: Number(subjectFormData.tutorialHours) || 0,
          practical: Number(subjectFormData.practicalHours) || 0
        },
        courseType: subjectFormData.courseType || 'Major',
        ncrfLevel: subjectFormData.ncrfLevel || 'Level 6.0',
        learningOutcomes: subjectFormData.learningOutcomes
          ? subjectFormData.learningOutcomes.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      if (editingSubject) {
        // Remove existing item from its original position
        const [dIdx, cIdx, bIdx, sIdx] = editingSubject.indices;
        const origDept = departments[dIdx];
        if (origDept) {
          const origDeptCopy = JSON.parse(JSON.stringify(origDept));
          if (editingSubject.locationType === 'semester') {
            const semIdx = editingSubject.indices[4];
            const subIdx = editingSubject.indices[5];
            const targetSem = origDeptCopy.courses?.[cIdx]?.branches?.[bIdx]?.sessions?.[sIdx]?.semesters?.[semIdx];
            if (targetSem && targetSem.subjects) {
              targetSem.subjects[subIdx] = newSubjectItem;
            }
          } else if (editingSubject.locationType === 'section') {
            const semIdx = editingSubject.indices[4];
            const secIdx = editingSubject.indices[5];
            const subIdx = editingSubject.indices[6];
            const targetSec = origDeptCopy.courses?.[cIdx]?.branches?.[bIdx]?.sessions?.[sIdx]?.semesters?.[semIdx]?.sections?.[secIdx];
            if (targetSec && targetSec.subjects) {
              targetSec.subjects[subIdx] = newSubjectItem;
            }
          }
          await api.put(`/courses/${origDept._id}`, origDeptCopy);
        }
        showToast('Subject updated successfully');
      } else {
        // Add new subject to semester's subjects array
        sem.subjects.push(newSubjectItem);
        await api.put(`/courses/${updatedDept._id}`, updatedDept);
        showToast('Subject created successfully');
      }

      setIsModalOpen(false);
      fetchHierarchies();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save subject', 'error');
    } finally {
      hideLoading();
    }
  };

  // Delete Subject
  const handleDeleteSubject = (sub) => {
    showConfirm(
      `Are you sure you want to delete the subject "${sub.name}"?`,
      async () => {
        showLoading('Deleting subject...');
        try {
          const dIdx = sub.indices[0];
          const dept = departments[dIdx];
          if (!dept) throw new Error('Department not found');

          const updatedDept = JSON.parse(JSON.stringify(dept));
          const [ , cIdx, bIdx, sIdx] = sub.indices;

          if (sub.locationType === 'semester') {
            const semIdx = sub.indices[4];
            const subIdx = sub.indices[5];
            updatedDept.courses[cIdx].branches[bIdx].sessions[sIdx].semesters[semIdx].subjects.splice(subIdx, 1);
          } else if (sub.locationType === 'section') {
            const semIdx = sub.indices[4];
            const secIdx = sub.indices[5];
            const subIdx = sub.indices[6];
            updatedDept.courses[cIdx].branches[bIdx].sessions[sIdx].semesters[semIdx].sections[secIdx].subjects.splice(subIdx, 1);
          } else if (sub.locationType === 'session') {
            const subIdx = sub.indices[4];
            updatedDept.courses[cIdx].branches[bIdx].sessions[sIdx].subjects.splice(subIdx, 1);
          }

          await api.put(`/courses/${dept._id}`, updatedDept);
          showToast('Subject deleted successfully');
          fetchHierarchies();
        } catch (error) {
          showToast(error.response?.data?.error || 'Failed to delete subject', 'error');
        } finally {
          hideLoading();
        }
      },
      { confirmText: 'Delete Subject', confirmType: 'danger', title: 'Confirm Delete' }
    );
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Major': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Minor': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'VAC': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SEC': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'AEC': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.2s_ease]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-base">
                <i className="fas fa-book-bookmark"></i>
              </span>
              Subjects & Curriculum Directory
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              NEP 2020 & NCrF
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, edit, and organize all subjects, course codes, credits, and syllabus frameworks across departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/admin/courses"
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center gap-2"
          >
            <i className="fas fa-network-wired text-purple-600"></i> Course Hierarchy
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-plus"></i> Add New Subject
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Subjects</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{allSubjects.length}</div>
          <div className="text-[11px] text-purple-600 mt-0.5">Across all programs</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Major Courses</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            {allSubjects.filter(s => (s.courseType || 'Major') === 'Major').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Core discipline papers</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">AEC / SEC / VAC</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {allSubjects.filter(s => ['AEC', 'SEC', 'VAC'].includes(s.courseType)).length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Value-add & skill papers</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Average Credits</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {allSubjects.length > 0
              ? (allSubjects.reduce((acc, s) => acc + (Number(s.creditPoints) || 4), 0) / allSubjects.length).toFixed(1)
              : '4.0'}
          </div>
          <div className="text-[11px] text-indigo-500 mt-0.5">Per paper credit load</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <i className="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by subject name, code (e.g. CS201), course..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Filter by Course */}
        <div className="sm:w-44">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">All Courses</option>
            {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Filter by Semester */}
        <div className="sm:w-40">
          <select
            value={selectedSemFilter}
            onChange={(e) => setSelectedSemFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Filter by Course Type */}
        <div className="sm:w-40">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            {COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2 text-purple-600"></i>
            <p className="text-xs">Loading curriculum subjects...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
              <i className="fas fa-book-open"></i>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No Subjects Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchTerm || selectedCourseFilter !== 'all' || selectedSemFilter !== 'all'
                ? 'No subjects matched your filter criteria. Try resetting filters or search query.'
                : 'No subjects have been added to your academic catalog yet. Click below to add your first subject.'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-plus"></i> Add New Subject
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/70 text-slate-600">
                  <th className="p-3.5 font-semibold">Subject Code</th>
                  <th className="p-3.5 font-semibold">Subject Title</th>
                  <th className="p-3.5 font-semibold">Course & Branch</th>
                  <th className="p-3.5 font-semibold">Semester</th>
                  <th className="p-3.5 font-semibold">Credits & Hours</th>
                  <th className="p-3.5 font-semibold">Category</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Code */}
                    <td className="p-3.5 font-mono font-semibold text-purple-700">
                      {sub.code ? (
                        <span className="bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[11px]">
                          {sub.code}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-sans">—</span>
                      )}
                    </td>

                    {/* Title */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{sub.name}</div>
                      {sub.learningOutcomes && sub.learningOutcomes.length > 0 && (
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs" title={Array.isArray(sub.learningOutcomes) ? sub.learningOutcomes.join(' • ') : sub.learningOutcomes}>
                          <i className="fas fa-bullseye text-purple-500 mr-1"></i>
                          {Array.isArray(sub.learningOutcomes) ? sub.learningOutcomes[0] : sub.learningOutcomes}
                        </div>
                      )}
                    </td>

                    {/* Course & Branch */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{sub.courseName || '—'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {sub.branchName || 'General Branch'}
                      </div>
                    </td>

                    {/* Semester */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {sub.semesterName || '1st Semester'}
                      </span>
                    </td>

                    {/* Credits */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">
                        {sub.creditPoints || 4} Credits
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        L: {sub.creditHours?.theory ?? 3} | T: {sub.creditHours?.tutorial ?? 1} | P: {sub.creditHours?.practical ?? 0}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeBadgeClass(sub.courseType || 'Major')}`}>
                        {sub.courseType || 'Major'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 flex items-center justify-center transition cursor-pointer"
                          title="Edit Subject"
                        >
                          <i className="fas fa-pencil text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 flex items-center justify-center transition cursor-pointer"
                          title="Delete Subject"
                        >
                          <i className="fas fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-3 sm:p-4 overflow-y-auto animate-[modalFadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-[modalSlideUp_0.25s_ease]">
            {/* Header */}
            <div className="flex justify-between items-center p-5 sm:p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-book-bookmark text-purple-600"></i>
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure subject details, credits, course alignment, and syllabus framework
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitSubject} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Course & Department Alignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={subjectFormData.departmentId}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, departmentId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs bg-white"
                      required
                    >
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Course / Program *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.Tech"
                      value={subjectFormData.courseName}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, courseName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs"
                      list="courseSuggestions"
                    />
                    <datalist id="courseSuggestions">
                      {uniqueCourses.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Branch / Specialization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Science & Engineering"
                      value={subjectFormData.branchName}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, branchName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Semester *
                    </label>
                    <select
                      value={subjectFormData.semesterName}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, semesterName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs bg-white"
                      required
                    >
                      {SEMESTERS.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>
                  </div>
                </div>

                {/* Subject Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Data Structures & Algorithms"
                      value={subjectFormData.name}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS201"
                      value={subjectFormData.code}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {/* NEP 2020 Course Category & Credit Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Course Category (NEP 2020)
                    </label>
                    <select
                      value={subjectFormData.courseType}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, courseType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs bg-white font-medium"
                    >
                      {COURSE_TYPES.map(t => <option key={t} value={t}>{t} Course</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Total Credit Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={subjectFormData.creditPoints}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, creditPoints: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs font-bold text-purple-900 bg-purple-50/40"
                    />
                  </div>
                </div>

                {/* Credit Hours (L-T-P) */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="font-semibold text-slate-700">Weekly Credit Load (Hours / Week)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Lecture (L)</span>
                      <input
                        type="number"
                        min="0"
                        value={subjectFormData.theoryHours}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, theoryHours: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Tutorial (T)</span>
                      <input
                        type="number"
                        min="0"
                        value={subjectFormData.tutorialHours}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, tutorialHours: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Practical (P)</span>
                      <input
                        type="number"
                        min="0"
                        value={subjectFormData.practicalHours}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, practicalHours: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Course Learning Outcomes (COs) (Comma separated)
                  </label>
                  <textarea
                    rows="2"
                    value={subjectFormData.learningOutcomes}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, learningOutcomes: e.target.value })}
                    placeholder="e.g. Master binary tree traversals, Analyze asymptotic complexity"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 text-xs"
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 sm:p-5 border-t bg-gray-50/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-save"></i>
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SubjectsManager;
