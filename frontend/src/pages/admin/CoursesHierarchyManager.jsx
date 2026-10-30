import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext, Link } from "react-router-dom";
import api from "../../utils/api";
import { allCourses } from "../../data/coursesData";
import InfoTooltip from "../../components/common/InfoTooltip";

// Intelligent course program specification defaults
export const getDefaultCourseSpec = (courseName = "") => {
  const norm = String(courseName).toLowerCase().trim();
  if (/\b(bca|bba|bsc|b\.sc|bcom|b\.com|ba|bachelor of arts|bachelor of commerce|bachelor of science|diploma)\b/i.test(norm)) {
    return { durationYears: 3, totalSemesters: 6 };
  }
  if (/\b(mca|mba|mtech|m\.tech|msc|m\.sc|mcom|m\.com|ma|master of arts|master of science|master of commerce|master of computer|mpharm|m\.pharm)\b/i.test(norm)) {
    return { durationYears: 2, totalSemesters: 4 };
  }
  if (/\b(btech|b\.tech|be|b\.e|bpharm|b\.pharm|bachelor of technology)\b/i.test(norm)) {
    return { durationYears: 4, totalSemesters: 8 };
  }
  if (/\b(certificate|pg diploma|pgdca)\b/i.test(norm)) {
    return { durationYears: 1, totalSemesters: 2 };
  }
  if (/\b(b\.arch|barch|ba llb|ballb|llb integrated)\b/i.test(norm)) {
    return { durationYears: 5, totalSemesters: 10 };
  }
  return { durationYears: 3, totalSemesters: 6 };
};

export const generateSemesterNames = (totalSemesters = 6) => {
  const count = Math.max(1, Math.min(Number(totalSemesters) || 6, 16));
  const names = [];
  for (let i = 1; i <= count; i++) {
    const suffix = i === 1 ? "1st" : i === 2 ? "2nd" : i === 3 ? "3rd" : `${i}th`;
    names.push(`${suffix} Semester`);
  }
  return names;
};

const PROGRAM_DURATION_PRESETS = [
  { label: "3 Years (6 Semesters)", years: 3, semesters: 6, hint: "BCA, BBA, B.Sc, B.Com, BA" },
  { label: "2 Years (4 Semesters)", years: 2, semesters: 4, hint: "MCA, MBA, M.Tech, M.Sc, M.Com" },
  { label: "4 Years (8 Semesters)", years: 4, semesters: 8, hint: "B.Tech, B.Pharm, B.E" },
  { label: "1 Year (2 Semesters)", years: 1, semesters: 2, hint: "Diploma, Certificate, PGDCA" },
  { label: "5 Years (10 Semesters)", years: 5, semesters: 10, hint: "Integrated Law, B.Arch" },
];

const POPULAR_BRANCHES = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical & Electronics Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
];

const CoursesHierarchyManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } =
    useOutletContext();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewNodeItem, setViewNodeItem] = useState(null);
  const [newSubject, setNewSubject] = useState("");
  const [modalSelectedSemester, setModalSelectedSemester] = useState("1st Semester");
  const [activeViewTab, setActiveViewTab] = useState("table"); // 'table' | 'allocator'
  const [newBranchInput, setNewBranchInput] = useState("");
  const [isAddingBranchInModal, setIsAddingBranchInModal] = useState(false);

  // Matrix Allocator state
  const [matrixDeptId, setMatrixDeptId] = useState("");
  const [matrixCourseName, setMatrixCourseName] = useState("");
  const [matrixBranchName, setMatrixBranchName] = useState("");
  const [matrixSessionName, setMatrixSessionName] = useState("");
  const [matrixInputs, setMatrixInputs] = useState({});

  // Modal State
  const [formData, setFormData] = useState({
    department: "",
    course: "",
    branch: "",
    branches: [],
    session: "",
    year: "1st Year",
    durationYears: 3,
    totalSemesters: 6,
  });

  // Granular Edit Modal State
  const [editNodeData, setEditNodeData] = useState({
    isOpen: false,
    level: "",
    deptId: "",
    indices: [],
    value: "",
    subjects: "",
    durationYears: 3,
    totalSemesters: 6,
  });

  const sessionOptions = [
    "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", 
    "2028-29", "2029-30", "2030-31", "2031-32", "2032-33", 
    "2033-34", "2034-35", "2035-36"
  ];
  const semesterOptions = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];
  const sectionOptions = [
    "Section A", "Section B", "Section C", "Section D", "General Section"
  ];

  useEffect(() => {
    fetchHierarchies();
  }, []);

  const fetchHierarchies = async () => {
    try {
      const res = await api.get("/courses");
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (error) {
      showToast("Failed to fetch hierarchies", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync matrix selectors when departments load or selection changes
  useEffect(() => {
    if (departments.length > 0) {
      const currentDept = departments.find(d => String(d._id) === String(matrixDeptId)) || departments[0];
      if (String(matrixDeptId) !== String(currentDept._id)) {
        setMatrixDeptId(currentDept._id);
      }

      const availableCourses = currentDept.courses || [];
      const currentCourse = availableCourses.find(c => c.name === matrixCourseName) || availableCourses[0];
      if (currentCourse && matrixCourseName !== currentCourse.name) {
        setMatrixCourseName(currentCourse.name);
      }

      const availableBranches = currentCourse?.branches || [];
      const currentBranch = availableBranches.find(b => b.name === matrixBranchName) || availableBranches[0];
      if (currentBranch && matrixBranchName !== currentBranch.name) {
        setMatrixBranchName(currentBranch.name);
      }

      const availableSessions = currentBranch?.sessions || [];
      const currentSession = availableSessions.find(s => s.name === matrixSessionName) || availableSessions[0];
      if (currentSession && matrixSessionName !== currentSession.name) {
        setMatrixSessionName(currentSession.name);
      }
    }
  }, [departments, matrixDeptId, matrixCourseName, matrixBranchName]);

  const predefinedCourses = useMemo(() => {
    const courseSet = new Set();
    const branchSet = new Set();
    allCourses.forEach((c) => {
      if (c.title.includes(" - ")) {
        const [course, branch] = c.title.split(" - ");
        courseSet.add(course.trim());
        branchSet.add(branch.trim());
      } else {
        courseSet.add(c.title);
      }
    });
    return {
      courses: Array.from(courseSet),
      branches: Array.from(branchSet),
    };
  }, []);

  const flattenedList = useMemo(() => {
    const list = [];
    departments.forEach((dept, dIdx) => {
      if (!dept.courses || dept.courses.length === 0) {
        list.push({
          id: dept._id,
          deptId: dept._id,
          deptName: dept.name,
          indices: [dIdx],
        });
        return;
      }
      dept.courses.forEach((course, cIdx) => {
        const courseDefaultSpec = getDefaultCourseSpec(course.name);
        const courseDuration = course.durationYears || courseDefaultSpec.durationYears;
        const courseTotalSems = course.totalSemesters || courseDefaultSpec.totalSemesters;

        if (!course.branches || course.branches.length === 0) {
          list.push({
            id: `${dept._id}-${cIdx}`,
            deptId: dept._id,
            deptName: dept.name,
            courseName: course.name,
            durationYears: courseDuration,
            totalSemesters: courseTotalSems,
            semesterCount: courseTotalSems,
            indices: [dIdx, cIdx],
          });
          return;
        }
        course.branches.forEach((branch, bIdx) => {
          if (!branch.sessions || branch.sessions.length === 0) {
            list.push({
              id: `${dept._id}-${cIdx}-${bIdx}`,
              deptId: dept._id,
              deptName: dept.name,
              courseName: course.name,
              durationYears: courseDuration,
              totalSemesters: courseTotalSems,
              semesterCount: courseTotalSems,
              branchName: branch.name,
              indices: [dIdx, cIdx, bIdx],
            });
            return;
          }
          branch.sessions.forEach((session, sIdx) => {
            const allSubjects = [];
            const semestersWithSubjects = new Set();

            if (session.semesters && session.semesters.length > 0) {
              session.semesters.forEach((sem) => {
                const subs = sem.subjects || [];
                if (subs.length > 0) {
                  semestersWithSubjects.add(sem.name);
                  subs.forEach((sub) => allSubjects.push(sub));
                }
              });
            }

            if (session.years && session.years.length > 0) {
              session.years.forEach((yr) => {
                (yr.semesters || []).forEach((sem) => {
                  const subs = sem.subjects || [];
                  if (subs.length > 0) {
                    semestersWithSubjects.add(sem.name);
                    subs.forEach((sub) => allSubjects.push(sub));
                  }
                });
              });
            }

            const targetDuration = session.durationYears || courseDuration;
            const targetTotalSemesters = session.totalSemesters || courseTotalSems;
            const configuredSemCount = session.semesters?.length || 0;
            const semCount = Math.max(targetTotalSemesters, configuredSemCount);

            list.push({
              id: `${dept._id}-${cIdx}-${bIdx}-${sIdx}`,
              deptId: dept._id,
              deptName: dept.name,
              courseName: course.name,
              durationYears: targetDuration,
              totalSemesters: semCount,
              courseNcrfLevel: course.ncrfLevel,
              courseCredits: course.totalCreditsRequired,
              branchName: branch.name,
              sessionName: session.name,
              semesterCount: semCount,
              configuredSemestersCount: semestersWithSubjects.size,
              totalSubjects: allSubjects.length,
              subjects: allSubjects,
              indices: [dIdx, cIdx, bIdx, sIdx],
            });
          });
        });
      });
    });
    return list;
  }, [departments]);

  const handleOpenModal = () => {
    setFormData({
      department: "",
      course: "",
      branch: "",
      branches: [],
      session: "",
      year: "1st Year",
      durationYears: 3,
      totalSemesters: 6,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddBranchToCourse = async (branchName) => {
    const nameToAdd = (branchName || newBranchInput).trim();
    if (!nameToAdd) {
      showToast("Please enter or select a branch name", "error");
      return;
    }
    if (!viewNodeItem) return;

    const dIdx = viewNodeItem.indices[0];
    const cIdx = viewNodeItem.indices[1];
    const dept = departments[dIdx];
    if (!dept || !dept.courses?.[cIdx]) {
      showToast("Course not found", "error");
      return;
    }

    showLoading("Adding branch...");
    try {
      const updatedDept = JSON.parse(JSON.stringify(dept));
      const course = updatedDept.courses[cIdx];
      if (!course.branches) course.branches = [];

      // Check if branch already exists
      if (course.branches.some((b) => b.name.toLowerCase() === nameToAdd.toLowerCase())) {
        showToast(`Branch "${nameToAdd}" already exists in this course`, "error");
        hideLoading();
        return;
      }

      const sessionName = viewNodeItem.sessionName || "2026-27";
      const targetDuration = course.durationYears || viewNodeItem.durationYears || 4;
      const targetSemesters = course.totalSemesters || viewNodeItem.totalSemesters || 8;

      const newBranch = {
        name: nameToAdd,
        sessions: [
          {
            name: sessionName,
            durationYears: targetDuration,
            totalSemesters: targetSemesters,
            semesters: [],
          },
        ],
      };
      course.branches.push(newBranch);

      await api.put(`/courses/${dept._id}`, updatedDept);
      showToast(`Branch "${nameToAdd}" added successfully!`);
      setNewBranchInput("");
      setIsAddingBranchInModal(false);
      await fetchHierarchies();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add branch", "error");
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department) return;

    showLoading("Saving...");
    try {
      let dept = departments.find((d) => d.name === formData.department);

      if (!dept) {
        const res = await api.post("/courses", { name: formData.department });
        dept = res.data.data;
      }

      if (formData.course) {
        let updatedDept = JSON.parse(JSON.stringify(dept));
        if (!updatedDept.courses) updatedDept.courses = [];

        let course = updatedDept.courses.find(
          (c) => c.name === formData.course,
        );
        const spec = getDefaultCourseSpec(formData.course);
        const courseYears = Number(formData.durationYears) || spec.durationYears;
        const courseSemesters = Number(formData.totalSemesters) || spec.totalSemesters;

        if (!course) {
          course = { 
            name: formData.course, 
            durationYears: courseYears,
            totalSemesters: courseSemesters,
            branches: [] 
          };
          updatedDept.courses.push(course);
        } else {
          if (!course.durationYears && formData.durationYears) {
            course.durationYears = courseYears;
          }
          if (!course.totalSemesters && formData.totalSemesters) {
            course.totalSemesters = courseSemesters;
          }
        }

        // Multi-branch collection
        let branchesToAdd = [];
        if (Array.isArray(formData.branches) && formData.branches.length > 0) {
          branchesToAdd = [...formData.branches];
        }
        if (formData.branch && formData.branch.trim()) {
          const typedBranches = formData.branch.split(",").map((b) => b.trim()).filter(Boolean);
          typedBranches.forEach((b) => {
            if (!branchesToAdd.includes(b)) {
              branchesToAdd.push(b);
            }
          });
        }

        const hasDeeper = branchesToAdd.length > 0 || formData.session;
        if (hasDeeper) {
          if (branchesToAdd.length === 0) {
            branchesToAdd = ["General Branch"];
          }
          if (!course.branches) course.branches = [];

          branchesToAdd.forEach((branchName) => {
            let branch = course.branches.find(
              (b) => b.name.toLowerCase() === branchName.toLowerCase(),
            );
            if (!branch) {
              branch = { name: branchName, sessions: [] };
              course.branches.push(branch);
            }

            if (formData.session) {
              const sessionName = formData.session || "General Session";
              if (!branch.sessions) branch.sessions = [];
              let session = branch.sessions.find((s) => s.name === sessionName);
              if (!session) {
                session = { 
                  name: sessionName, 
                  durationYears: course.durationYears || courseYears,
                  totalSemesters: course.totalSemesters || courseSemesters,
                  semesters: [] 
                };
                branch.sessions.push(session);
              }
            }
          });
        }
        await api.put(`/courses/${updatedDept._id}`, updatedDept);
      }

      showToast("Class hierarchy added successfully");
      handleCloseModal();
      fetchHierarchies();
    } catch (error) {
      showToast(error.response?.data?.error || "Operation failed", "error");
    } finally {
      hideLoading();
    }
  };

  const handleDeleteDepartment = (id) => {
    showConfirm(
      "Are you sure you want to delete this department?",
      async () => {
        showLoading("Deleting...");
        try {
          await api.delete(`/courses/${id}`);
          showToast("Deleted successfully");
          fetchHierarchies();
        } catch (error) {
          showToast("Failed to delete", "error");
        } finally {
          hideLoading();
        }
      },
    );
  };

  const handleEditNode = (
    level,
    deptId,
    indices,
    currentValue,
    currentSubjects = [],
    extraData = {},
  ) => {
    let durYears = extraData.durationYears;
    let totSems = extraData.totalSemesters;
    if (level === "course") {
      const dIdx = indices[0];
      const cIdx = indices[1];
      const courseObj = departments[dIdx]?.courses?.[cIdx];
      const spec = getDefaultCourseSpec(currentValue || courseObj?.name);
      durYears = courseObj?.durationYears || durYears || spec.durationYears;
      totSems = courseObj?.totalSemesters || totSems || spec.totalSemesters;
    }
    setEditNodeData({
      isOpen: true,
      level,
      deptId,
      indices,
      value: currentValue,
      subjects: currentSubjects.join(", "),
      durationYears: durYears || 3,
      totalSemesters: totSems || 6,
    });
  };

  const submitEditNode = async (e) => {
    e.preventDefault();
    showLoading(`Updating ${editNodeData.level}...`);
    try {
      if (editNodeData.level === "department") {
        const dIdx = editNodeData.indices[0];
        let updatedDept = JSON.parse(JSON.stringify(departments[dIdx]));
        updatedDept.name = editNodeData.value;
        await api.put(`/courses/${editNodeData.deptId}`, updatedDept);
      } else {
        const dIdx = editNodeData.indices[0];
        let updatedDept = JSON.parse(JSON.stringify(departments[dIdx]));

        if (editNodeData.level === "course") {
          const course = updatedDept.courses[editNodeData.indices[1]];
          course.name = editNodeData.value;
          course.durationYears = Number(editNodeData.durationYears) || 3;
          course.totalSemesters = Number(editNodeData.totalSemesters) || 6;
          // Cascade updated duration & totalSemesters to all sessions
          (course.branches || []).forEach((br) => {
            (br.sessions || []).forEach((sess) => {
              sess.durationYears = course.durationYears;
              sess.totalSemesters = course.totalSemesters;
            });
          });
        } else if (editNodeData.level === "branch") {
          updatedDept.courses[editNodeData.indices[1]].branches[
            editNodeData.indices[2]
          ].name = editNodeData.value;
        } else if (editNodeData.level === "session") {
          updatedDept.courses[editNodeData.indices[1]].branches[
            editNodeData.indices[2]
          ].sessions[editNodeData.indices[3]].name = editNodeData.value;
        } else if (editNodeData.level === "semester") {
          updatedDept.courses[editNodeData.indices[1]].branches[
            editNodeData.indices[2]
          ].sessions[editNodeData.indices[3]].semesters[
            editNodeData.indices[4]
          ].name = editNodeData.value;
        } else if (editNodeData.level === "section") {
          updatedDept.courses[editNodeData.indices[1]].branches[
            editNodeData.indices[2]
          ].sessions[editNodeData.indices[3]].semesters[
            editNodeData.indices[4]
          ].sections[editNodeData.indices[5]].name = editNodeData.value;
          updatedDept.courses[editNodeData.indices[1]].branches[
            editNodeData.indices[2]
          ].sessions[editNodeData.indices[3]].semesters[
            editNodeData.indices[4]
          ].sections[editNodeData.indices[5]].subjects = editNodeData.subjects
            ? editNodeData.subjects
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
        }
        await api.put(`/courses/${editNodeData.deptId}`, updatedDept);
      }
      showToast(`${editNodeData.level} updated successfully`);
      setEditNodeData({ ...editNodeData, isOpen: false });
      if (isViewModalOpen && viewNodeItem) {
        setViewNodeItem((prev) => ({
          ...prev,
          courseName: editNodeData.level === "course" ? editNodeData.value : prev.courseName,
          durationYears: editNodeData.level === "course" ? Number(editNodeData.durationYears) : prev.durationYears,
          totalSemesters: editNodeData.level === "course" ? Number(editNodeData.totalSemesters) : prev.totalSemesters,
          semesterCount: editNodeData.level === "course" ? Number(editNodeData.totalSemesters) : prev.semesterCount,
        }));
      }
      fetchHierarchies();
    } catch (error) {
      showToast("Failed to update", "error");
    } finally {
      hideLoading();
    }
  };

  // Get session semesters & active subjects for the view modal
  const getModalSessionData = useMemo(() => {
    if (!viewNodeItem || !departments.length) {
      return { semesters: [], activeSemester: "1st Semester", activeSubjects: [] };
    }
    const dIdx = viewNodeItem.indices[0];
    const dept = departments[dIdx];
    if (!dept) return { semesters: [], activeSemester: "1st Semester", activeSubjects: [] };

    const cIdx = viewNodeItem.indices[1];
    const bIdx = viewNodeItem.indices[2];
    const sIdx = viewNodeItem.indices[3];
    const course = dept.courses?.[cIdx];
    const branch = course?.branches?.[bIdx];
    const session = branch?.sessions?.[sIdx];

    const defaultSpec = getDefaultCourseSpec(course?.name || viewNodeItem.courseName);
    const targetSemCount = session?.totalSemesters || course?.totalSemesters || viewNodeItem.totalSemesters || defaultSpec.totalSemesters;
    const standardSemesters = generateSemesterNames(targetSemCount);

    const semsMap = new Map();
    standardSemesters.forEach((name) => {
      semsMap.set(name, []);
    });

    if (session) {
      (session.semesters || []).forEach((sem) => {
        semsMap.set(sem.name, sem.subjects || []);
      });

      (session.years || []).forEach((yr) => {
        (yr.semesters || []).forEach((sem) => {
          semsMap.set(sem.name, sem.subjects || []);
        });
      });
    }

    const allSemestersList = Array.from(semsMap.entries()).map(([name, subjects]) => ({
      name,
      subjects: subjects || [],
      count: (subjects || []).length,
    }));

    const activeSemName = modalSelectedSemester || viewNodeItem.semName || "1st Semester";
    const activeSemObj = allSemestersList.find((s) => s.name === activeSemName) || allSemestersList[0];

    return {
      semesters: allSemestersList,
      activeSemester: activeSemObj?.name || "1st Semester",
      activeSubjects: activeSemObj?.subjects || [],
      targetSemCount,
    };
  }, [viewNodeItem, departments, modalSelectedSemester]);

  const handleRemoveSubjectFromNode = async (item, subjectToRemove, targetSemName) => {
    showLoading("Removing subject...");
    try {
      const dIdx = item.indices[0];
      let updatedDept = JSON.parse(JSON.stringify(departments[dIdx]));
      const removeMatch = (sub) => {
        const name = typeof sub === "string" ? sub : sub.name;
        const targetName = typeof subjectToRemove === "string" ? subjectToRemove : subjectToRemove?.name;
        return name !== targetName;
      };

      const course = updatedDept.courses?.[item.indices[1]];
      const branch = course?.branches?.[item.indices[2]];
      const sess = branch?.sessions?.[item.indices[3]];
      const semName = targetSemName || item.semName || modalSelectedSemester || "1st Semester";

      if (sess && sess.semesters) {
        const sem = sess.semesters.find(s => s.name === semName);
        if (sem && sem.subjects) {
          sem.subjects = sem.subjects.filter(removeMatch);
        }
      }
      if (sess && sess.years) {
        sess.years.forEach(yr => {
          (yr.semesters || []).forEach(s => {
            if (s.name === semName && s.subjects) {
              s.subjects = s.subjects.filter(removeMatch);
            }
          });
        });
      }

      await api.put(`/courses/${item.deptId}`, updatedDept);
      showToast("Subject removed successfully");
      await fetchHierarchies();
    } catch (error) {
      showToast("Failed to remove subject", "error");
    } finally {
      hideLoading();
    }
  };

  const handleAddSubjectToNode = async (item, subjectToAdd, targetSemName) => {
    if (!subjectToAdd || !subjectToAdd.trim()) return;

    // Split by commas for bulk adding
    const names = subjectToAdd
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    showLoading(names.length > 1 ? `Adding ${names.length} subjects...` : "Adding subject...");
    try {
      const dIdx = item.indices[0];
      let updatedDept = JSON.parse(JSON.stringify(departments[dIdx]));
      const course = updatedDept.courses?.[item.indices[1]];
      const branch = course?.branches?.[item.indices[2]];
      const sess = branch?.sessions?.[item.indices[3]];

      if (!sess) {
        showToast("Unable to resolve class session", "error");
        return;
      }

      const semName = targetSemName || item.semName || modalSelectedSemester || "1st Semester";

      // 1. Ensure sess.semesters exists
      if (!sess.semesters) sess.semesters = [];
      let sem = sess.semesters.find(s => s.name === semName);

      // 2. If not in sess.semesters, check in sess.years
      if (!sem && sess.years && sess.years.length > 0) {
        for (const yr of sess.years) {
          const found = (yr.semesters || []).find(s => s.name === semName);
          if (found) {
            sem = found;
            break;
          }
        }
      }

      // 3. If still not found, create it in sess.semesters
      if (!sem) {
        sem = { name: semName, sections: [{ name: "Section A", subjects: [] }], subjects: [] };
        sess.semesters.push(sem);
      }
      if (!sem.subjects) sem.subjects = [];

      let addedCount = 0;
      let alreadyExisted = 0;

      names.forEach(name => {
        const exists = sem.subjects.some(
          s => (typeof s === "string" ? s : s.name).toLowerCase() === name.toLowerCase()
        );
        if (!exists) {
          sem.subjects.push({
            name,
            code: "",
            creditPoints: 4,
            creditHours: { theory: 3, tutorial: 1, practical: 0 },
            courseType: "Major",
            ncrfLevel: "Level 6.0"
          });
          addedCount++;
        } else {
          alreadyExisted++;
        }
      });

      await api.put(`/courses/${item.deptId}`, updatedDept);

      if (addedCount > 0) {
        showToast(
          `Added ${addedCount} subject${addedCount > 1 ? "s" : ""} to ${semName}${
            alreadyExisted > 0 ? ` (${alreadyExisted} already existed)` : ""
          }`
        );
      } else {
        showToast(`Subject(s) already exist in ${semName}`, "info");
      }

      setNewSubject("");
      await fetchHierarchies();
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to add subject", "error");
    } finally {
      hideLoading();
    }
  };

  // Matrix Allocator Handlers
  const handleAddSubjectToMatrix = async (semName, subjectInput) => {
    if (!subjectInput || !subjectInput.trim()) return;

    const names = subjectInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    showLoading(`Adding ${names.length} subject(s) to ${semName}...`);
    try {
      const dept = departments.find(d => String(d._id) === String(matrixDeptId));
      if (!dept) {
        showToast("Department not found", "error");
        return;
      }

      let updatedDept = JSON.parse(JSON.stringify(dept));
      let course = (updatedDept.courses || []).find(c => c.name === matrixCourseName);
      if (!course) {
        course = { name: matrixCourseName, branches: [] };
        if (!updatedDept.courses) updatedDept.courses = [];
        updatedDept.courses.push(course);
      }

      let branch = (course.branches || []).find(b => b.name === matrixBranchName);
      if (!branch) {
        branch = { name: matrixBranchName, sessions: [] };
        if (!course.branches) course.branches = [];
        course.branches.push(branch);
      }

      let session = (branch.sessions || []).find(s => s.name === matrixSessionName);
      if (!session) {
        session = { name: matrixSessionName, semesters: [] };
        if (!branch.sessions) branch.sessions = [];
        branch.sessions.push(session);
      }

      if (!session.semesters) session.semesters = [];
      let sem = session.semesters.find(s => s.name === semName);
      if (!sem) {
        sem = { name: semName, sections: [{ name: "Section A", subjects: [] }], subjects: [] };
        session.semesters.push(sem);
      }
      if (!sem.subjects) sem.subjects = [];

      let addedCount = 0;
      let alreadyExisted = 0;

      names.forEach(name => {
        const exists = sem.subjects.some(
          s => (typeof s === "string" ? s : s.name).toLowerCase() === name.toLowerCase()
        );
        if (!exists) {
          sem.subjects.push({
            name,
            code: "",
            creditPoints: 4,
            creditHours: { theory: 3, tutorial: 1, practical: 0 },
            courseType: "Major",
            ncrfLevel: "Level 6.0"
          });
          addedCount++;
        } else {
          alreadyExisted++;
        }
      });

      await api.put(`/courses/${dept._id}`, updatedDept);

      if (addedCount > 0) {
        showToast(
          `Added ${addedCount} subject${addedCount > 1 ? "s" : ""} to ${semName}${
            alreadyExisted > 0 ? ` (${alreadyExisted} already existed)` : ""
          }`
        );
      } else {
        showToast(`Subject(s) already exist in ${semName}`, "info");
      }

      setMatrixInputs(prev => ({ ...prev, [semName]: "" }));
      await fetchHierarchies();
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to add subject", "error");
    } finally {
      hideLoading();
    }
  };

  const handleRemoveSubjectFromMatrix = async (semName, subjectToRemove) => {
    showLoading("Removing subject...");
    try {
      const dept = departments.find(d => String(d._id) === String(matrixDeptId));
      if (!dept) return;

      let updatedDept = JSON.parse(JSON.stringify(dept));
      const course = (updatedDept.courses || []).find(c => c.name === matrixCourseName);
      const branch = course?.branches?.find(b => b.name === matrixBranchName);
      const session = branch?.sessions?.find(s => s.name === matrixSessionName);

      const removeMatch = (sub) => {
        const name = typeof sub === "string" ? sub : sub.name;
        const targetName = typeof subjectToRemove === "string" ? subjectToRemove : subjectToRemove?.name;
        return name !== targetName;
      };

      if (session && session.semesters) {
        const sem = session.semesters.find(s => s.name === semName);
        if (sem && sem.subjects) {
          sem.subjects = sem.subjects.filter(removeMatch);
        }
      }
      if (session && session.years) {
        session.years.forEach(yr => {
          (yr.semesters || []).forEach(s => {
            if (s.name === semName && s.subjects) {
              s.subjects = s.subjects.filter(removeMatch);
            }
          });
        });
      }

      await api.put(`/courses/${dept._id}`, updatedDept);
      showToast("Subject removed successfully");
      await fetchHierarchies();
    } catch (error) {
      showToast("Failed to remove subject", "error");
    } finally {
      hideLoading();
    }
  };

  const matrixData = useMemo(() => {
    const currentDept = departments.find(d => String(d._id) === String(matrixDeptId)) || departments[0];
    const courses = currentDept?.courses || [];
    const currentCourse = courses.find(c => c.name === matrixCourseName) || courses[0];
    const branches = currentCourse?.branches || [];
    const currentBranch = branches.find(b => b.name === matrixBranchName) || branches[0];
    const sessions = currentBranch?.sessions || [];
    const currentSession = sessions.find(s => s.name === matrixSessionName) || sessions[0];

    const defaultSpec = getDefaultCourseSpec(currentCourse?.name);
    const targetSemCount = currentSession?.totalSemesters || currentCourse?.totalSemesters || defaultSpec.totalSemesters;
    const standardSemesters = generateSemesterNames(targetSemCount);

    const semsMap = new Map();
    standardSemesters.forEach(name => semsMap.set(name, []));

    if (currentSession) {
      if (currentSession.semesters && currentSession.semesters.length > 0) {
        currentSession.semesters.forEach(sem => {
          semsMap.set(sem.name, sem.subjects || []);
        });
      }
      if (currentSession.years && currentSession.years.length > 0) {
        currentSession.years.forEach(yr => {
          (yr.semesters || []).forEach(sem => {
            semsMap.set(sem.name, sem.subjects || []);
          });
        });
      }
    }

    const semestersList = Array.from(semsMap.entries()).map(([name, subjects]) => ({
      name,
      subjects: subjects || [],
      count: (subjects || []).length
    }));

    const totalSubjects = semestersList.reduce((acc, sem) => acc + sem.count, 0);

    return {
      currentDept,
      courses,
      currentCourse,
      branches,
      currentBranch,
      sessions,
      currentSession,
      semesters: semestersList,
      totalSubjects,
      targetSemCount,
      targetDurationYears: currentSession?.durationYears || currentCourse?.durationYears || defaultSpec.durationYears
    };
  }, [departments, matrixDeptId, matrixCourseName, matrixBranchName, matrixSessionName]);

  const handleOpenMatrixForClass = (item) => {
    if (!item) return;
    setMatrixDeptId(item.deptId);
    setMatrixCourseName(item.courseName || "");
    setMatrixBranchName(item.branchName || "");
    setMatrixSessionName(item.sessionName || "");
    setActiveViewTab("allocator");
  };

  const handleDeleteNode = (level, deptId, indices) => {
    showConfirm(
      `Are you sure you want to delete this ${level}? This will also delete all items under it.`,
      async () => {
        showLoading(`Deleting ${level}...`);
        try {
          if (level === "department") {
            await api.delete(`/courses/${deptId}`);
          } else {
            const dIdx = indices[0];
            let updatedDept = JSON.parse(JSON.stringify(departments[dIdx]));

            if (level === "course") {
              updatedDept.courses.splice(indices[1], 1);
            } else if (level === "branch") {
              updatedDept.courses[indices[1]].branches.splice(indices[2], 1);
            } else if (level === "session") {
              updatedDept.courses[indices[1]].branches[
                indices[2]
              ].sessions.splice(indices[3], 1);
            } else if (level === "semester") {
              updatedDept.courses[indices[1]].branches[indices[2]].sessions[
                indices[3]
              ].semesters.splice(indices[4], 1);
            } else if (level === "section") {
              updatedDept.courses[indices[1]].branches[indices[2]].sessions[
                indices[3]
              ].semesters[indices[4]].sections.splice(indices[5], 1);
            }
            await api.put(`/courses/${deptId}`, updatedDept);
          }
          showToast(`${level} deleted successfully`);
          if (isViewModalOpen) setIsViewModalOpen(false);
          fetchHierarchies();
        } catch (error) {
          showToast("Failed to delete", "error");
        } finally {
          hideLoading();
        }
      },
    );
  };

  const handleDeleteWholeClass = () => {
    if (!viewNodeItem) return;
    let level = "department";
    if (viewNodeItem.sectionName) level = "section";
    else if (viewNodeItem.semName) level = "semester";
    else if (viewNodeItem.sessionName) level = "session";
    else if (viewNodeItem.branchName) level = "branch";
    else if (viewNodeItem.courseName) level = "course";

    handleDeleteNode(level, viewNodeItem.deptId, viewNodeItem.indices);
  };

  const handleAddMoreDetails = () => {
    let yearVal = "1st Year";
    let semVal = "1st Semester";
    if (viewNodeItem.semName && viewNodeItem.semName.includes(" - ")) {
      const parts = viewNodeItem.semName.split(" - ");
      yearVal = parts[0];
      semVal = parts[1];
    } else if (viewNodeItem.semName) {
      semVal = viewNodeItem.semName;
    }
    
    setFormData({
      department: viewNodeItem.deptName || "",
      course: viewNodeItem.courseName || "",
      branch: viewNodeItem.branchName || "",
      session: viewNodeItem.sessionName || "",
      year: yearVal,
    });
    setIsViewModalOpen(false);
    setIsModalOpen(true);
  };

  const activeViewDept = departments.find((d) => d._id === viewNodeItem?.deptId) || departments[viewNodeItem?.indices?.[0]];
  const activeViewCourse = activeViewDept?.courses?.[viewNodeItem?.indices?.[1]];
  const activeViewCourseBranches = activeViewCourse?.branches || [];

  return (
    <div className="animate-[modalFadeIn_0.3s_ease]">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Courses Hierarchy
            </h1>
            <InfoTooltip
              title="Academic Hierarchy & Sections"
              text="Define your institution's academic structure: Departments, Degree Courses, Branches, Sessions, Semesters, Sections, and assigned Subject Syllabi."
              tip="Sections created here automatically appear across Students Manager, Attendance, and Fee portals."
            />
          </div>
          <p className="text-gray-500 text-sm">
            Manage all sections, batches, and academic classes across the institution
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/subjects"
            className="px-4 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition flex items-center gap-2 shadow-2xs"
          >
            <i className="fas fa-book-open-reader text-purple-600"></i> Subjects Directory
          </Link>
          <button
            onClick={handleOpenModal}
            className="bg-[#6D4C9C] text-white px-4 py-2.5 rounded-lg hover:bg-[#5B21B6] transition-colors font-medium text-xs flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
          >
            <i className="fas fa-plus"></i> Add Class
          </button>
        </div>
      </div>
      {/* View Switcher Tabs */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveViewTab("table")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewTab === "table"
                ? "bg-[#6D4C9C] text-white shadow-sm shadow-purple-500/20"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-table-cells text-xs"></i>
            <span>All Classes & Hierarchy Table</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeViewTab === "table" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {flattenedList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab("allocator")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeViewTab === "allocator"
                ? "bg-[#6D4C9C] text-white shadow-sm shadow-purple-500/20"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-cubes text-xs"></i>
            <span>Semester-wise Subject Allocator</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
              Direct Matrix
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 pr-2">
          {activeViewTab === "allocator" ? (
            <span className="flex items-center gap-1.5 text-purple-700 font-medium">
              <i className="fas fa-bolt text-amber-500"></i>
              Manage subjects for all {matrixData.semesters.length} semesters under one session
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <i className="fas fa-info-circle text-gray-400"></i>
              Click on any row's &quot;View&quot; button to manage subjects in modal
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <i className="fas fa-circle-notch fa-spin text-2xl"></i>
        </div>
      ) : activeViewTab === "allocator" ? (
        /* Semester-wise Subject Allocation Studio */
        <div className="space-y-5">
          {/* Cascading Filter Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <i className="fas fa-layer-group text-sm"></i>
                  </span>
                  Semester-wise Subject Allocation Studio
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select an academic class hierarchy to view and map all {matrixData.semesters.length} semesters simultaneously with instant bulk-entry.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block uppercase font-semibold">Total Subjects Mapped</span>
                  <span className="text-lg font-extrabold text-purple-700 font-mono">
                    {matrixData.totalSubjects} Subjects
                  </span>
                </div>
              </div>
            </div>

            {/* Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              {/* Department Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>1. Department</span>
                  <span className="text-purple-600 font-mono">{departments.length}</span>
                </label>
                <select
                  value={matrixDeptId}
                  onChange={(e) => {
                    const newDeptId = e.target.value;
                    setMatrixDeptId(newDeptId);
                    const targetDept = departments.find(d => String(d._id) === String(newDeptId));
                    const firstCourse = targetDept?.courses?.[0];
                    const firstBranch = firstCourse?.branches?.[0];
                    const firstSession = firstBranch?.sessions?.[0];
                    setMatrixCourseName(firstCourse ? firstCourse.name : "");
                    setMatrixBranchName(firstBranch ? firstBranch.name : "");
                    setMatrixSessionName(firstSession ? firstSession.name : "");
                  }}
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>2. Programme / Course</span>
                  <span className="text-purple-600 font-mono">{matrixData.courses.length}</span>
                </label>
                <select
                  value={matrixCourseName}
                  onChange={(e) => {
                    const newCourseName = e.target.value;
                    setMatrixCourseName(newCourseName);
                    const targetCourse = matrixData.courses.find(c => c.name === newCourseName);
                    const firstBranch = targetCourse?.branches?.[0];
                    const firstSession = firstBranch?.sessions?.[0];
                    setMatrixBranchName(firstBranch ? firstBranch.name : "");
                    setMatrixSessionName(firstSession ? firstSession.name : "");
                  }}
                  disabled={matrixData.courses.length === 0}
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition disabled:opacity-50"
                >
                  {matrixData.courses.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {matrixData.courses.length === 0 && <option value="">No Courses Configured</option>}
                </select>
              </div>

              {/* Branch Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>3. Branch / Specialization</span>
                  <span className="text-purple-600 font-mono">{matrixData.branches.length}</span>
                </label>
                <select
                  value={matrixBranchName}
                  onChange={(e) => {
                    const newBranchName = e.target.value;
                    setMatrixBranchName(newBranchName);
                    const targetBranch = matrixData.branches.find(b => b.name === newBranchName);
                    const firstSession = targetBranch?.sessions?.[0];
                    setMatrixSessionName(firstSession ? firstSession.name : "");
                  }}
                  disabled={matrixData.branches.length === 0}
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition disabled:opacity-50"
                >
                  {matrixData.branches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  {matrixData.branches.length === 0 && <option value="">No Branches Configured</option>}
                </select>
              </div>

              {/* Session Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>4. Academic Session</span>
                  <span className="text-purple-600 font-mono">{matrixData.sessions.length}</span>
                </label>
                <select
                  value={matrixSessionName}
                  onChange={(e) => setMatrixSessionName(e.target.value)}
                  disabled={matrixData.sessions.length === 0}
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition disabled:opacity-50"
                >
                  {matrixData.sessions.map((s) => (
                    <option key={s.name} value={s.name}>
                      Session {s.name}
                    </option>
                  ))}
                  {matrixData.sessions.length === 0 && <option value="">No Sessions Found</option>}
                </select>
              </div>
            </div>

            {/* Breadcrumb banner */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600 flex-wrap">
                <span className="font-semibold text-gray-800">{matrixData.currentDept?.name || "Department"}</span>
                <i className="fas fa-chevron-right text-[10px] text-gray-400"></i>
                <span className="font-semibold text-purple-700">{matrixData.currentCourse?.name || "Course"}</span>
                <i className="fas fa-chevron-right text-[10px] text-gray-400"></i>
                <span className="text-gray-700">{matrixData.currentBranch?.name || "Branch"}</span>
                <i className="fas fa-chevron-right text-[10px] text-gray-400"></i>
                <span className="bg-purple-100 text-purple-800 font-mono px-2 py-0.5 rounded font-bold">
                  Session {matrixData.currentSession?.name || "None"}
                </span>
              </div>
              <div className="text-[11px] text-gray-500">
                <i className="fas fa-keyboard text-purple-500 mr-1"></i>
                Type or paste multiple subjects with commas, then press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-mono border">Enter</kbd>
              </div>
            </div>
          </div>

          {/* 8-Semester Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {matrixData.semesters.map((sem, sIdx) => {
              const inputVal = matrixInputs[sem.name] || "";
              const semesterColors = [
                { border: "border-purple-200", badge: "bg-purple-100 text-purple-700", head: "bg-purple-50/70" },
                { border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700", head: "bg-indigo-50/70" },
                { border: "border-blue-200", badge: "bg-blue-100 text-blue-700", head: "bg-blue-50/70" },
                { border: "border-cyan-200", badge: "bg-cyan-100 text-cyan-700", head: "bg-cyan-50/70" },
                { border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", head: "bg-emerald-50/70" },
                { border: "border-teal-200", badge: "bg-teal-100 text-teal-700", head: "bg-teal-50/70" },
                { border: "border-amber-200", badge: "bg-amber-100 text-amber-700", head: "bg-amber-50/70" },
                { border: "border-rose-200", badge: "bg-rose-100 text-rose-700", head: "bg-rose-50/70" },
              ];
              const color = semesterColors[sIdx % semesterColors.length];

              return (
                <div
                  key={sem.name}
                  className={`bg-white rounded-2xl border ${color.border} shadow-xs flex flex-col justify-between hover:shadow-md transition-all overflow-hidden`}
                >
                  {/* Semester Header */}
                  <div className={`p-3.5 border-b border-gray-100 ${color.head} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white shadow-2xs text-purple-700 font-bold text-xs flex items-center justify-center font-mono">
                        {sIdx + 1}
                      </span>
                      <h4 className="font-bold text-gray-900 text-xs tracking-tight">
                        {sem.name}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color.badge}`}>
                      {sem.count} {sem.count === 1 ? "Subject" : "Subjects"}
                    </span>
                  </div>

                  {/* Subjects List */}
                  <div className="p-3.5 flex-1 min-h-[140px] max-h-[220px] overflow-y-auto space-y-1.5">
                    {sem.subjects.length > 0 ? (
                      sem.subjects.map((sub, idx) => {
                        const displayName = typeof sub === "string" ? sub : (sub.code ? `${sub.name} (${sub.code})` : sub.name);
                        return (
                          <div
                            key={idx}
                            className="group/sub bg-gray-50 hover:bg-purple-50/80 border border-gray-200/80 hover:border-purple-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 flex items-center justify-between gap-1.5 transition-all"
                          >
                            <span className="truncate font-medium text-[11px]" title={displayName}>
                              {displayName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubjectFromMatrix(sem.name, sub)}
                              className="opacity-0 group-hover/sub:opacity-100 text-gray-400 hover:text-red-600 rounded-full w-4 h-4 flex items-center justify-center shrink-0 transition-opacity cursor-pointer"
                              title="Remove subject"
                            >
                              <i className="fas fa-times text-[10px]"></i>
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                        <i className="fas fa-book text-gray-300 text-xl mb-1.5"></i>
                        <span className="text-[11px]">No subjects mapped yet</span>
                      </div>
                    )}
                  </div>

                  {/* Input & Add Button */}
                  <div className="p-3 border-t border-gray-100 bg-gray-50/60">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={inputVal}
                        onChange={(e) => setMatrixInputs({ ...matrixInputs, [sem.name]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSubjectToMatrix(sem.name, inputVal);
                          }
                        }}
                        placeholder="Subject(s), comma-sep..."
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubjectToMatrix(sem.name, inputVal)}
                        disabled={!inputVal.trim()}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                        title="Add Subject (or press Enter)"
                      >
                        <i className="fas fa-plus text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-gray-700 border-b border-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    <span className="inline-flex items-center">
                      Department
                      <InfoTooltip title="Academic Department" text="Top-level school/faculty unit (e.g., Engineering, Management, Pharmacy)." position="bottom" />
                    </span>
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">
                    <span className="inline-flex items-center">
                      Course / Degree
                      <InfoTooltip title="Degree Programme" text="Registered degree/diploma program (e.g., B.Tech, MBA, BCA)." position="bottom" />
                    </span>
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">Branch / Stream</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Academic Session</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Semesters</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Subjects Status</th>
                  <th className="p-4 font-semibold text-right pr-6 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {flattenedList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <i className="fas fa-layer-group text-3xl text-gray-300"></i>
                        <p className="font-medium text-gray-600">No academic classes or batches found</p>
                        <p className="text-xs text-gray-400">Click &ldquo;+ Add Class&rdquo; above to register your first class hierarchy.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  flattenedList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/20 transition-colors group whitespace-nowrap"
                    >
                      <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center justify-between group/cell gap-2">
                          <span className="font-semibold text-gray-800">{item.deptName}</span>
                          <button
                            onClick={() =>
                              handleEditNode(
                                "department",
                                item.deptId,
                                item.indices,
                                item.deptName,
                              )
                            }
                            title="Edit Department"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8B5CF6] hover:text-[#5B21B6] p-1"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                          <span className="font-semibold text-gray-900">{item.courseName || "-"}</span>
                          {item.courseName && (
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60 whitespace-nowrap shrink-0">
                              {item.durationYears || Math.round((item.semesterCount || 6) / 2)} Yrs &bull; {item.semesterCount || item.totalSemesters || 6} Sems
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 whitespace-nowrap">
                        <span>{item.branchName || "-"}</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {item.sessionName ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 whitespace-nowrap shrink-0">
                            {item.sessionName}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {item.sessionName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/70 whitespace-nowrap shrink-0">
                            <i className="fas fa-layer-group text-[10px]"></i>
                            <span>{item.semesterCount} Semesters</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {item.sessionName ? (
                          item.totalSubjects > 0 ? (
                            <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                                <i className="fas fa-check-circle text-[10px]"></i>
                                <span>{item.totalSubjects} Subs</span>
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenMatrixForClass(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
                              title="Open Allocator to map subjects for this batch"
                            >
                              <i className="fas fa-plus text-[10px]"></i>
                              <span>Map Subs</span>
                            </button>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap shrink-0">
                          <button
                            onClick={() => {
                              setViewNodeItem(item);
                              setModalSelectedSemester("1st Semester");
                              setIsViewModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                            title="View / Manage Class Details"
                          >
                            <i className="fas fa-eye text-[#8B5CF6]"></i> View
                          </button>
                          {item.sessionName && (
                            <button
                              onClick={() => handleOpenMatrixForClass(item)}
                              title="Open Semester Allocator Grid for this Session"
                              className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <i className="fas fa-cubes text-xs"></i> Allocator
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const level = item.sessionName
                                ? "session"
                                : item.branchName
                                ? "branch"
                                : item.courseName
                                ? "course"
                                : "department";
                              handleDeleteNode(level, item.deptId, item.indices);
                            }}
                            title="Delete this class"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1 whitespace-nowrap shrink-0"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold">Add New Class / Batch</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    list="deptList"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none"
                    placeholder="e.g. Computer Science"
                  />
                  <datalist id="deptList">
                    {departments.map((d) => (
                      <option key={d._id} value={d.name} />
                    ))}
                  </datalist>
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Course / Degree Program
                  </label>
                  <input
                    type="text"
                    list="courseList"
                    value={formData.course}
                    onChange={(e) => {
                      const courseVal = e.target.value;
                      const spec = getDefaultCourseSpec(courseVal);
                      setFormData({ 
                        ...formData, 
                        course: courseVal,
                        durationYears: spec.durationYears,
                        totalSemesters: spec.totalSemesters
                      });
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none"
                    placeholder="e.g. BCA, MCA, B.Tech"
                  />
                  <datalist id="courseList">
                    {predefinedCourses.courses.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* Multi-Branch Support */}
                <div className="md:col-span-2 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fas fa-code-branch text-purple-600"></i>
                      Branch / Specialization (Multi-Branch Adding Support)
                    </label>
                    <span className="text-[11px] text-purple-600 font-medium">
                      {(formData.branches?.length || 0)} branch(es) queued
                    </span>
                  </div>

                  {/* Suggested preset chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="text-[11px] text-gray-500 font-medium mr-1">Popular:</span>
                    {POPULAR_BRANCHES.map((bName) => {
                      const isSelected = (formData.branches || []).includes(bName);
                      return (
                        <button
                          key={bName}
                          type="button"
                          onClick={() => {
                            const current = formData.branches || [];
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                branches: current.filter((b) => b !== bName),
                              });
                            } else {
                              setFormData({
                                ...formData,
                                branches: [...current, bName],
                              });
                            }
                          }}
                          className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-white text-gray-700 hover:bg-purple-50 border border-gray-200"
                          }`}
                        >
                          <i className={`fas ${isSelected ? 'fa-check' : 'fa-plus'} text-[9px]`}></i>
                          {bName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input with Add button */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      list="branchList"
                      value={formData.branch}
                      onChange={(e) =>
                        setFormData({ ...formData, branch: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = formData.branch?.trim();
                          if (val) {
                            const current = formData.branches || [];
                            if (!current.includes(val)) {
                              setFormData({
                                ...formData,
                                branches: [...current, val],
                                branch: "",
                              });
                            } else {
                              setFormData({ ...formData, branch: "" });
                            }
                          }
                        }
                      }}
                      className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Type custom branch (e.g. Electrical Engineering) & press Enter or Add"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = formData.branch?.trim();
                        if (val) {
                          const current = formData.branches || [];
                          if (!current.includes(val)) {
                            setFormData({
                              ...formData,
                              branches: [...current, val],
                              branch: "",
                            });
                          } else {
                            setFormData({ ...formData, branch: "" });
                          }
                        }
                      }}
                      disabled={!formData.branch?.trim()}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <i className="fas fa-plus text-[10px]"></i> Add Branch
                    </button>
                    <datalist id="branchList">
                      {predefinedCourses.branches.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>

                  {/* Selected Branches Tags */}
                  {(formData.branches && formData.branches.length > 0) ? (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-lg border border-gray-200">
                      {formData.branches.map((br) => (
                        <span
                          key={br}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-md text-xs font-medium"
                        >
                          <i className="fas fa-check-circle text-purple-600 text-[10px]"></i>
                          {br}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                branches: formData.branches.filter((b) => b !== br),
                              })
                            }
                            className="text-purple-400 hover:text-red-500 ml-1 cursor-pointer"
                            title="Remove branch"
                          >
                            <i className="fas fa-times text-[10px]"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic">
                      Tip: Select one or more branches above, or type custom branch names to batch-create.
                    </p>
                  )}
                </div>

                {/* Program Duration & Semesters Control */}
                <div className="md:col-span-2 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fas fa-graduation-cap text-purple-600"></i>
                      Program Duration & Semesters
                    </label>
                    <span className="text-[11px] text-purple-600 font-medium">
                      Auto-detected or choose preset
                    </span>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {PROGRAM_DURATION_PRESETS.map((p) => {
                      const isActive =
                        Number(formData.durationYears) === p.years &&
                        Number(formData.totalSemesters) === p.semesters;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              durationYears: p.years,
                              totalSemesters: p.semesters,
                            })
                          }
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                            isActive
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-white text-gray-700 hover:bg-purple-100/70 border border-purple-200/70"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Duration (Years)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={formData.durationYears || 3}
                        onChange={(e) => {
                          const yrs = Number(e.target.value) || 1;
                          setFormData({
                            ...formData,
                            durationYears: yrs,
                            totalSemesters: yrs * 2,
                          });
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Total Semesters
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.totalSemesters || 6}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            totalSemesters: Number(e.target.value) || 1,
                          })
                        }
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Session */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Session
                  </label>
                  <select 
                    value={sessionOptions.includes(formData.session) ? formData.session : (formData.session ? 'Other' : '')} 
                    onChange={e => {
                      if (e.target.value !== 'Other') {
                        setFormData({...formData, session: e.target.value});
                      } else {
                        setFormData({...formData, session: ' '}); // trigger text input
                      }
                    }} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none mb-2"
                  >
                    <option value="">Select Session</option>
                    {sessionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="Other">Other (Manual Entry)</option>
                  </select>
                  {(!sessionOptions.includes(formData.session) && formData.session !== '') && (
                    <input type="text" placeholder="Enter manual session" value={formData.session.trim()} onChange={e => setFormData({...formData, session: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none" />
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Year (Optional)
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none"
                  >
                    <option value="">None</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                </div>
              </div>

              {/* Note on per-student semester and section */}
              <div className="mt-5 p-3.5 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
                <i className="fas fa-info-circle text-[#8B5CF6] text-lg mt-0.5"></i>
                <div className="text-xs text-purple-900 leading-relaxed">
                  <span className="font-semibold">Semester & Section Control:</span> Semesters and sections are managed on an individual student level and can be promoted batch-wise by Session admin in the <strong>Students Manager</strong>.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium shadow-md hover:-translate-y-0.5 transition-all"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Node Modal */}
      {editNodeData.isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[modalFadeIn_0.2s_ease]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-[modalSlideUp_0.25s_ease]">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold capitalize">
                Edit {editNodeData.level}
              </h2>
              <button
                onClick={() =>
                  setEditNodeData({ ...editNodeData, isOpen: false })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <form onSubmit={submitEditNode} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                  {editNodeData.level} Name
                </label>
                <input
                  type="text"
                  required
                  value={editNodeData.value}
                  onChange={(e) =>
                    setEditNodeData({ ...editNodeData, value: e.target.value })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none"
                />
              </div>

              {editNodeData.level === "course" && (
                <div className="mb-4 bg-purple-50/60 p-3.5 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <i className="fas fa-graduation-cap text-purple-600"></i>
                      Program Duration & Semesters
                    </label>
                    <span className="text-[11px] text-purple-600 font-medium">
                      Select or customize
                    </span>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {PROGRAM_DURATION_PRESETS.map((p) => {
                      const isActive =
                        Number(editNodeData.durationYears) === p.years &&
                        Number(editNodeData.totalSemesters) === p.semesters;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() =>
                            setEditNodeData({
                              ...editNodeData,
                              durationYears: p.years,
                              totalSemesters: p.semesters,
                            })
                          }
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                            isActive
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-white text-gray-700 hover:bg-purple-100/70 border border-purple-200/70"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Duration (Years)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={editNodeData.durationYears || 3}
                        onChange={(e) => {
                          const yrs = Number(e.target.value) || 1;
                          setEditNodeData({
                            ...editNodeData,
                            durationYears: yrs,
                            totalSemesters: yrs * 2,
                          });
                        }}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Total Semesters
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={editNodeData.totalSemesters || 6}
                        onChange={(e) =>
                          setEditNodeData({
                            ...editNodeData,
                            totalSemesters: Number(e.target.value) || 1,
                          })
                        }
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-purple-700 mt-2.5 leading-snug">
                    <i className="fas fa-info-circle mr-1"></i>
                    Updates the number of semester tabs across View Modal and Semester Allocator for all batches under this program.
                  </p>
                </div>
              )}

              {editNodeData.level === "section" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Subjects (comma separated)
                  </label>
                  <textarea
                    rows="3"
                    value={editNodeData.subjects}
                    onChange={(e) =>
                      setEditNodeData({
                        ...editNodeData,
                        subjects: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none"
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setEditNodeData({ ...editNodeData, isOpen: false })
                  }
                  className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium shadow-md hover:-translate-y-0.5 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Modal */}
      {isViewModalOpen && viewNodeItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[modalFadeIn_0.3s_ease]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-[modalSlideUp_0.3s_ease]">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Class Details
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4 mb-6">
                {/* Department Row */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                      Department
                    </span>
                    <span className="text-gray-900 font-medium">
                      {viewNodeItem.deptName}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleEditNode(
                          "department",
                          viewNodeItem.deptId,
                          viewNodeItem.indices,
                          viewNodeItem.deptName,
                        )
                      }
                      className="text-[#8B5CF6] hover:bg-purple-50 p-2 rounded transition-colors"
                      title="Edit Department"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteNode("department", viewNodeItem.deptId, viewNodeItem.indices)}
                      className="text-[#6D4C9C] hover:bg-purple-50 p-2 rounded transition-colors"
                      title="Delete Entire Department"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>

                {/* Course Row */}
                {viewNodeItem.courseName && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                        Course / Degree
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-gray-900 font-medium">
                          {viewNodeItem.courseName}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                          <i className="fas fa-graduation-cap text-[10px]"></i>
                          {viewNodeItem.durationYears || Math.round((viewNodeItem.semesterCount || 6) / 2)} Years &bull; {viewNodeItem.semesterCount || viewNodeItem.totalSemesters || 6} Semesters
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleEditNode(
                            "course",
                            viewNodeItem.deptId,
                            viewNodeItem.indices,
                            viewNodeItem.courseName,
                            [],
                            {
                              durationYears: viewNodeItem.durationYears,
                              totalSemesters: viewNodeItem.semesterCount || viewNodeItem.totalSemesters,
                            }
                          )
                        }
                        className="text-[#8B5CF6] hover:bg-purple-50 p-2 rounded transition-colors"
                        title="Edit Course Name & Semesters/Duration"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteNode("course", viewNodeItem.deptId, viewNodeItem.indices)}
                        className="text-[#6D4C9C] hover:bg-purple-50 p-2 rounded transition-colors"
                        title="Delete Entire Course"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Branch Row */}
                {viewNodeItem.branchName && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                        Branch
                      </span>
                      <span className="text-gray-900 font-medium">
                        {viewNodeItem.branchName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleEditNode(
                            "branch",
                            viewNodeItem.deptId,
                            viewNodeItem.indices,
                            viewNodeItem.branchName,
                          )
                        }
                        className="text-[#8B5CF6] hover:bg-purple-50 p-2 rounded transition-colors"
                        title="Edit Branch"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteNode("branch", viewNodeItem.deptId, viewNodeItem.indices)}
                        className="text-[#6D4C9C] hover:bg-purple-50 p-2 rounded transition-colors"
                        title="Delete Entire Branch"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Course Branches & Multi-Branch Network */}
                {viewNodeItem.courseName && activeViewCourse && (
                  <div className="border-b pb-4 pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                          <i className="fas fa-code-branch text-purple-600"></i> All Course Branches ({activeViewCourseBranches.length})
                        </span>
                        <span className="text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                          Multi-Branch Management
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingBranchInModal(!isAddingBranchInModal)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <i className={`fas ${isAddingBranchInModal ? 'fa-minus' : 'fa-plus'} text-[10px]`}></i>
                        {isAddingBranchInModal ? 'Cancel' : 'Add Branch'}
                      </button>
                    </div>

                    {/* Branches Pills */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {activeViewCourseBranches.map((br, bIdx) => {
                        const isCurrent = br.name === viewNodeItem.branchName;
                        return (
                          <div
                            key={br._id || br.name || bIdx}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                              isCurrent
                                ? "bg-purple-100 border-purple-300 text-purple-900 font-semibold shadow-2xs"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <span>{br.name}</span>
                            <button
                              onClick={() =>
                                handleEditNode(
                                  "branch",
                                  viewNodeItem.deptId,
                                  [viewNodeItem.indices[0], viewNodeItem.indices[1], bIdx],
                                  br.name,
                                )
                              }
                              title={`Edit ${br.name}`}
                              className="text-purple-600 hover:text-purple-800 p-0.5 transition-colors"
                            >
                              <i className="fas fa-edit text-[10px]"></i>
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteNode(
                                  "branch",
                                  viewNodeItem.deptId,
                                  [viewNodeItem.indices[0], viewNodeItem.indices[1], bIdx],
                                )
                              }
                              title={`Delete ${br.name}`}
                              className="text-gray-400 hover:text-red-600 p-0.5 transition-colors"
                            >
                              <i className="fas fa-trash-alt text-[10px]"></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Inline Add Branch Form */}
                    {isAddingBranchInModal && (
                      <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2.5 mt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBranchInput}
                            onChange={(e) => setNewBranchInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddBranchToCourse(newBranchInput);
                              }
                            }}
                            placeholder="e.g. Electronics & Communication Engineering"
                            className="flex-1 text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddBranchToCourse(newBranchInput)}
                            disabled={!newBranchInput.trim()}
                            className="px-3 py-2 bg-[#6D4C9C] hover:bg-[#5B21B6] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer shrink-0"
                          >
                            <i className="fas fa-plus text-[10px]"></i> Save Branch
                          </button>
                        </div>

                        {/* Quick preset buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-gray-500 font-medium mr-1">Quick Add:</span>
                          {POPULAR_BRANCHES.filter(
                            (pb) => !activeViewCourseBranches.some((b) => b.name.toLowerCase() === pb.toLowerCase())
                          ).map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleAddBranchToCourse(preset)}
                              className="px-2 py-0.5 rounded-full bg-white border border-purple-200 hover:bg-purple-100 text-purple-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                            >
                              <i className="fas fa-plus text-[9px]"></i> {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Session Row */}
                {viewNodeItem.sessionName && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                        Session
                      </span>
                      <span className="text-gray-900 font-medium">
                        {viewNodeItem.sessionName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleEditNode(
                            "session",
                            viewNodeItem.deptId,
                            viewNodeItem.indices,
                            viewNodeItem.sessionName,
                          )
                        }
                        className="text-[#8B5CF6] hover:bg-purple-50 p-2 rounded transition-colors"
                        title="Edit Session"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteNode("session", viewNodeItem.deptId, viewNodeItem.indices)}
                        className="text-[#6D4C9C] hover:bg-purple-50 p-2 rounded transition-colors"
                        title="Delete Entire Session"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Semester Selection Block */}
                <div className="border-b pb-4 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <i className="fas fa-layer-group text-purple-600"></i> Semester
                      </span>
                      <span className="text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                        Select a semester to view & map subjects
                      </span>
                    </div>
                  </div>

                  {/* Semester Tabs / Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {getModalSessionData.semesters.map((semObj) => {
                      const isSelected = getModalSessionData.activeSemester === semObj.name;
                      return (
                        <button
                          key={semObj.name}
                          type="button"
                          onClick={() => setModalSelectedSemester(semObj.name)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30"
                              : "bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200"
                          }`}
                        >
                          <span>{semObj.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : semObj.count > 0
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {semObj.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Row (if applicable) */}
                {viewNodeItem.sectionName && (
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">
                        Section
                      </span>
                      <span className="text-gray-900 font-medium">
                        {viewNodeItem.sectionName}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleEditNode(
                            "section",
                            viewNodeItem.deptId,
                            viewNodeItem.indices,
                            viewNodeItem.sectionName,
                            viewNodeItem.subjects,
                          )
                        }
                        className="text-[#8B5CF6] hover:bg-purple-50 p-2 rounded transition-colors"
                        title="Edit Section"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteNode("section", viewNodeItem.deptId, viewNodeItem.indices)}
                        className="text-[#6D4C9C] hover:bg-purple-50 p-2 rounded transition-colors"
                        title="Delete Section"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Subjects Section for Active Semester */}
              <div className="mt-4 pt-2">
                <div className="flex justify-between items-start sm:items-center mb-3 flex-col sm:flex-row gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-book-open text-purple-600"></i> Assigned Subjects
                      <span className="text-xs font-bold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full normal-case">
                        {getModalSessionData.activeSemester} ({getModalSessionData.activeSubjects.length} subjects)
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Enter or paste subjects separated by commas (e.g. <em>Data Structures, OS, DBMS</em>) and press <strong>Enter</strong>.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenMatrixForClass(viewNodeItem);
                        setIsViewModalOpen(false);
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fas fa-cubes text-[11px]"></i> Open Allocator View
                    </button>
                    <Link
                      to="/admin/subjects"
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1"
                    >
                      Full Directory <i className="fas fa-arrow-right text-[10px]"></i>
                    </Link>
                  </div>
                </div>

                {getModalSessionData.activeSubjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                    {getModalSessionData.activeSubjects.map((sub, idx) => {
                      const displayName = typeof sub === "string" ? sub : (sub.code ? `${sub.name} (${sub.code})` : sub.name);
                      return (
                        <div
                          key={idx}
                          className="bg-purple-50/90 border border-purple-200 text-purple-900 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 shadow-2xs hover:border-purple-300 transition-all"
                        >
                          <span>{displayName}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveSubjectFromNode(viewNodeItem, sub, getModalSessionData.activeSemester)
                            }
                            className="text-purple-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                            title="Remove subject"
                          >
                            <i className="fas fa-times text-[10px]"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic mb-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex items-center gap-2">
                    <i className="fas fa-info-circle text-purple-500"></i>
                    <span>No subjects mapped to <strong>{getModalSessionData.activeSemester}</strong> yet. Add subjects below.</span>
                  </div>
                )}

                {/* Add Subject Input with comma separation & Enter key */}
                <div className="flex gap-2 mt-4 items-center">
                  <div className="relative flex-1">
                    <i className="fas fa-pen-nib absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder={`Enter subject name(s), comma-separated for ${getModalSessionData.activeSemester}...`}
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-xs transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newSubject.trim()) {
                            handleAddSubjectToNode(viewNodeItem, newSubject, getModalSessionData.activeSemester);
                          }
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddSubjectToNode(viewNodeItem, newSubject, getModalSessionData.activeSemester)
                    }
                    disabled={!newSubject.trim()}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <i className="fas fa-plus text-[10px]"></i> Add Subject
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => {
                  const level = viewNodeItem.sessionName
                    ? "session"
                    : viewNodeItem.branchName
                    ? "branch"
                    : viewNodeItem.courseName
                    ? "course"
                    : "department";
                  handleDeleteNode(level, viewNodeItem.deptId, viewNodeItem.indices);
                }}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 cursor-pointer border border-red-200/60"
              >
                <i className="fas fa-trash-alt"></i> {viewNodeItem.sessionName ? "Delete Batch" : "Delete Course"}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleAddMoreDetails}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded font-medium hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <i className="fas fa-plus mr-1"></i> Add Details
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesHierarchyManager;
