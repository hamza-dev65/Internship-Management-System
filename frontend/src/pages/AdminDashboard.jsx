import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import {
  getInterns,
  onboardIntern,
  updateIntern,
  deleteIntern,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getSubmissions,
  reviewSubmission,
} from "../services/api";

const AdminDashboard = () => {
  // Tabs: 'overview', 'interns', 'tasks', 'submissions'
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Form States
  const [showInternModal, setShowInternModal] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null); // If editing
  const [internFormData, setInternFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    joiningDate: "",
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // If editing
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    assignedTo: "",
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");

  // Load dashboard data
  const loadData = async () => {
    setLoading(true);
    try {
      const [internsRes, tasksRes, submissionsRes] = await Promise.all([
        getInterns(),
        getTasks(),
        getSubmissions(),
      ]);
      setInterns(internsRes.data);
      setTasks(tasksRes.data);
      setSubmissions(submissionsRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Intern CRUD Handlers
  const handleInternSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIntern) {
        // Update intern
        await updateIntern(editingIntern._id, internFormData);
      } else {
        // Create/Onboard intern
        await onboardIntern(internFormData);
      }
      setShowInternModal(false);
      setEditingIntern(null);
      resetInternForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save intern profile.");
    }
  };

  const handleEditIntern = (intern) => {
    setEditingIntern(intern);
    setInternFormData({
      name: intern.name,
      email: intern.email,
      password: "", // Leave blank for security
      department: intern.department || "",
      joiningDate: intern.joiningDate ? intern.joiningDate.split("T")[0] : "",
    });
    setShowInternModal(true);
  };

  const handleDeleteIntern = async (id) => {
    if (window.confirm("Are you sure you want to delete this intern? This will also remove all their tasks and submissions.")) {
      try {
        await deleteIntern(id);
        loadData();
      } catch (err) {
        setError("Failed to delete intern.");
      }
    }
  };

  const resetInternForm = () => {
    setInternFormData({
      name: "",
      email: "",
      password: "",
      department: "",
      joiningDate: "",
    });
  };

  // Task CRUD Handlers
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask._id, taskFormData);
      } else {
        await createTask(taskFormData);
      }
      setShowTaskModal(false);
      setEditingTask(null);
      resetTaskForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task.");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description,
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        loadData();
      } catch (err) {
        setError("Failed to delete task.");
      }
    }
  };

  const resetTaskForm = () => {
    setTaskFormData({
      title: "",
      description: "",
      deadline: "",
      assignedTo: "",
    });
  };

  // Submission / Review Handlers
  const handleOpenReview = (task) => {
    // Find the submission corresponding to this task
    const submission = submissions.find(
      (s) => s.taskId?._id === task._id && s.taskId?.status === "Submitted"
    );
    if (submission) {
      setSelectedSubmission(submission);
      setFeedbackText(submission.feedback || "");
      setShowReviewModal(true);
    } else {
      // Find submission by task id fallback
      const submissionById = submissions.find(
        (s) => (s.taskId?._id || s.taskId) === task._id
      );
      if (submissionById) {
        setSelectedSubmission(submissionById);
        setFeedbackText(submissionById.feedback || "");
        setShowReviewModal(true);
      } else {
        alert("Submission records not loaded yet. Try refreshing.");
      }
    }
  };

  const handleReviewSubmit = async (status) => {
    try {
      await reviewSubmission(selectedSubmission._id, feedbackText, status);
      setShowReviewModal(false);
      setSelectedSubmission(null);
      setFeedbackText("");
      loadData();
    } catch (err) {
      setError("Failed to submit feedback.");
    }
  };

  // Derived Statistics
  const totalInterns = interns.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const pendingReviewCount = tasks.filter((t) => t.status === "Submitted").length;

  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="dashboard-main">
        {/* Header Section */}
        <header className="dashboard-header">
          <div>
            <h1>Admin Control Panel</h1>
            <p>Onboard interns, assign tasks, and monitor system-wide progress.</p>
          </div>
          <div className="dashboard-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingIntern(null);
                resetInternForm();
                setShowInternModal(true);
              }}
            >
              + Onboard Intern
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingTask(null);
                resetTaskForm();
                setShowTaskModal(true);
              }}
            >
              + Create Task
            </button>
          </div>
        </header>

        {error && <div className="dashboard-alert error">{error}</div>}

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">👥</div>
            <div className="stat-details">
              <span className="stat-label">Total Interns</span>
              <span className="stat-value">{totalInterns}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper orange">📝</div>
            <div className="stat-details">
              <span className="stat-label">Tasks Active</span>
              <span className="stat-value">
                {completedTasks}/{totalTasks}
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper green">📥</div>
            <div className="stat-details">
              <span className="stat-label">Pending Review</span>
              <span className="stat-value">{pendingReviewCount}</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "interns" ? "active" : ""}`}
            onClick={() => setActiveTab("interns")}
          >
            Interns List ({totalInterns})
          </button>
          <button
            className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            All Tasks ({totalTasks})
          </button>
          <button
            className={`tab-btn ${activeTab === "submissions" ? "active" : ""}`}
            onClick={() => setActiveTab("submissions")}
          >
            Submissions ({submissions.length})
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard metrics...</p>
          </div>
        ) : (
          <div className="tab-content">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid-2-1">
                <div className="dashboard-panel">
                  <h2>Recent Submissions</h2>
                  {submissions.filter(s => s.taskId?.status === "Submitted").length === 0 ? (
                    <div className="empty-state">
                      <p>🎉 No pending submissions. Excellent job!</p>
                    </div>
                  ) : (
                    <div className="submissions-list">
                      {submissions
                        .filter(s => s.taskId?.status === "Submitted")
                        .map((sub) => (
                          <div key={sub._id} className="submission-item">
                            <div className="sub-info">
                              <h4>{sub.taskId?.title}</h4>
                              <p>Submitted by: <strong>{sub.internId?.name}</strong></p>
                              <a href={sub.workLink} target="_blank" rel="noopener noreferrer" className="work-link-preview">
                                {sub.workLink} ↗
                              </a>
                            </div>
                            <button
                              className="btn btn-accent btn-sm"
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setFeedbackText(sub.feedback || "");
                                setShowReviewModal(true);
                              }}
                            >
                              Review & Grade
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="dashboard-panel">
                  <h2>Intern Performance</h2>
                  {interns.length === 0 ? (
                    <div className="empty-state">
                      <p>No interns onboarded yet.</p>
                    </div>
                  ) : (
                    <div className="performance-list">
                      {interns
                        .sort((a, b) => b.progress - a.progress)
                        .slice(0, 5)
                        .map((intern) => (
                          <div key={intern._id} className="performance-item">
                            <div className="perf-header">
                              <span className="perf-name">{intern.name}</span>
                              <span className="perf-percentage">{intern.progress}%</span>
                            </div>
                            <div className="perf-bar-bg">
                              <div
                                className="perf-bar-fill"
                                style={{ width: `${intern.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INTERNS TAB */}
            {activeTab === "interns" && (
              <div className="dashboard-panel">
                <h2>Manage Interns</h2>
                {interns.length === 0 ? (
                  <div className="empty-state">
                    <p>No interns onboarded yet. Click "Onboard Intern" above to start.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Joining Date</th>
                          <th>Overall Progress</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interns.map((intern) => (
                          <tr key={intern._id}>
                            <td>
                              <strong>{intern.name}</strong>
                            </td>
                            <td>{intern.email}</td>
                            <td>
                              <span className="dept-badge">{intern.department || "General"}</span>
                            </td>
                            <td>{new Date(intern.joiningDate).toLocaleDateString()}</td>
                            <td>
                              <div className="table-progress-cell">
                                <span className="progress-text">{intern.progress}%</span>
                                <div className="progress-track">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${intern.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="btn btn-secondary btn-xs"
                                  onClick={() => handleEditIntern(intern)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-xs"
                                  onClick={() => handleDeleteIntern(intern._id)}
                                >
                                  Delete
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
            )}

            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <div className="dashboard-panel">
                <h2>All Assigned Tasks</h2>
                {tasks.length === 0 ? (
                  <div className="empty-state">
                    <p>No tasks created yet. Click "Create Task" above to assign work.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        role="admin"
                        onReviewWork={handleOpenReview}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUBMISSIONS TAB */}
            {activeTab === "submissions" && (
              <div className="dashboard-panel">
                <h2>Submission History</h2>
                {submissions.length === 0 ? (
                  <div className="empty-state">
                    <p>No work submitted by interns yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Task Title</th>
                          <th>Intern</th>
                          <th>Work Link</th>
                          <th>Status</th>
                          <th>Feedback</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub) => (
                          <tr key={sub._id}>
                            <td>
                              <strong>{sub.taskId?.title || "Deleted Task"}</strong>
                            </td>
                            <td>{sub.internId?.name || "Deleted Intern"}</td>
                            <td>
                              <a
                                href={sub.workLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link"
                              >
                                View Work ↗
                              </a>
                            </td>
                            <td>
                              <span className={`status-text ${sub.taskId?.status || "Pending"}`}>
                                {sub.taskId?.status || "Pending"}
                              </span>
                            </td>
                            <td className="feedback-col">
                              {sub.feedback ? (
                                <span className="feedback-preview">{sub.feedback}</span>
                              ) : (
                                <em className="text-muted">No feedback yet</em>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-secondary btn-xs"
                                onClick={() => {
                                  setSelectedSubmission(sub);
                                  setFeedbackText(sub.feedback || "");
                                  setShowReviewModal(true);
                                }}
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ONBOARD INTERN MODAL */}
      {showInternModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingIntern ? "Edit Intern Profile" : "Onboard New Intern"}</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  setShowInternModal(false);
                  setEditingIntern(null);
                  resetInternForm();
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInternSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={internFormData.name}
                  onChange={(e) =>
                    setInternFormData({ ...internFormData, name: e.target.value })
                  }
                  required
                  placeholder="e.g. Alice Smith"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={internFormData.email}
                  onChange={(e) =>
                    setInternFormData({ ...internFormData, email: e.target.value })
                  }
                  required
                  placeholder="e.g. alice@company.com"
                />
              </div>
              
              {/* Only require password for onboarding */}
              <div className="form-group">
                <label>Password {editingIntern && "(leave blank to keep current)"}</label>
                <input
                  type="password"
                  value={internFormData.password}
                  onChange={(e) =>
                    setInternFormData({ ...internFormData, password: e.target.value })
                  }
                  required={!editingIntern}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={internFormData.department}
                  onChange={(e) =>
                    setInternFormData({ ...internFormData, department: e.target.value })
                  }
                  placeholder="e.g. Software Development"
                />
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input
                  type="date"
                  value={internFormData.joiningDate}
                  onChange={(e) =>
                    setInternFormData({ ...internFormData, joiningDate: e.target.value })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowInternModal(false);
                    setEditingIntern(null);
                    resetInternForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIntern ? "Save Changes" : "Onboard Intern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK FORM MODAL */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingTask ? "Edit Assigned Task" : "Assign New Task"}</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  resetTaskForm();
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="modal-form">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                  }
                  required
                  placeholder="e.g. Implement Login Route"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, description: e.target.value })
                  }
                  required
                  placeholder="Details about task objectives, links to resources, etc."
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={taskFormData.deadline}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, deadline: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Assign To Intern</label>
                <select
                  value={taskFormData.assignedTo}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, assignedTo: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select Intern --</option>
                  {interns.map((intern) => (
                    <option key={intern._id} value={intern._id}>
                      {intern.name} ({intern.department || "No Dept"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    resetTaskForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? "Save Task" : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW & FEEDBACK MODAL */}
      {showReviewModal && selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Review Work Submission</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedSubmission(null);
                  setFeedbackText("");
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="review-meta">
                <p><strong>Task:</strong> {selectedSubmission.taskId?.title}</p>
                <p><strong>Intern:</strong> {selectedSubmission.internId?.name}</p>
                <p>
                  <strong>Work Link:</strong>{" "}
                  <a
                    href={selectedSubmission.workLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    {selectedSubmission.workLink} ↗
                  </a>
                </p>
              </div>

              <div className="form-group">
                <label>Review Feedback / Remarks</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Provide instructions, praise, or requested changes..."
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer flex-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedSubmission(null);
                  setFeedbackText("");
                }}
              >
                Close
              </button>
              <div className="action-buttons-group">
                <button
                  type="button"
                  className="btn btn-danger mr-2"
                  onClick={() => handleReviewSubmit("Pending")}
                >
                  Request Revision
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleReviewSubmit("Completed")}
                >
                  Approve Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
