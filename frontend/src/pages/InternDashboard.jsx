import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import { getTasks, submitWork, getSubmissions, getInternDetails } from "../services/api";

const InternDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [internStats, setInternStats] = useState({ progress: 0, department: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tabs: 'tasks', 'submissions'
  const [activeTab, setActiveTab] = useState("tasks");

  // Submission Modal States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [workLink, setWorkLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const internId = localStorage.getItem("id");

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, submissionsRes, detailsRes] = await Promise.all([
        getTasks(),
        getSubmissions(),
        getInternDetails(internId)
      ]);
      setTasks(tasksRes.data);
      setSubmissions(submissionsRes.data);
      if (detailsRes.data?.stats) {
        setInternStats({
          progress: detailsRes.data.stats.progress,
          department: detailsRes.data.intern?.department || "General"
        });
      }
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

  const handleOpenSubmitModal = (task) => {
    setSelectedTask(task);
    // Pre-fill workLink if already submitted
    const existingSub = submissions.find(s => s.taskId?._id === task._id);
    setWorkLink(existingSub ? existingSub.workLink : "");
    setShowSubmitModal(true);
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitWork(selectedTask._id, workLink);
      setShowSubmitModal(false);
      setSelectedTask(null);
      setWorkLink("");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit work.");
    } finally {
      setSubmitting(false);
    }
  };

  // Derived metrics
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === "Completed").length;
  const pendingTasksCount = tasks.filter(t => t.status === "Pending").length;
  const submittedTasksCount = tasks.filter(t => t.status === "Submitted").length;
  
  // Dynamic progress bar calculation
  const computedProgress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Intern Workspace</h1>
            <p>Track your assignments, submit your deliverables, and read manager feedback.</p>
          </div>
          <div className="dashboard-meta-badge">
            <span className="meta-label">Department:</span>
            <span className="meta-val">{internStats.department || "Technology"}</span>
          </div>
        </header>

        {error && <div className="dashboard-alert error">{error}</div>}

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">📋</div>
            <div className="stat-details">
              <span className="stat-label">Assigned Tasks</span>
              <span className="stat-value">{totalTasks}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper orange">⏳</div>
            <div className="stat-details">
              <span className="stat-label">Pending / Submitted</span>
              <span className="stat-value">
                {pendingTasksCount} / {submittedTasksCount}
              </span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper green">📈</div>
            <div className="stat-details">
              <span className="stat-label">Overall Progress</span>
              <span className="stat-value">{computedProgress}%</span>
            </div>
          </div>
        </section>

        {/* Progress bar panel */}
        <section className="progress-section-panel dashboard-panel">
          <div className="progress-bar-header">
            <h3>Completion Milestone</h3>
            <span>{completedTasksCount} of {totalTasks} Tasks Completed</span>
          </div>
          <div className="progress-bar-large-track">
            <div className="progress-bar-large-fill" style={{ width: `${computedProgress}%` }}>
              <span className="progress-label-overlay">{computedProgress}%</span>
            </div>
          </div>
        </section>

        {/* Tab Selection */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            My Tasks ({totalTasks})
          </button>
          <button
            className={`tab-btn ${activeTab === "submissions" ? "active" : ""}`}
            onClick={() => setActiveTab("submissions")}
          >
            Submission History ({submissions.length})
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Updating workspace tasks...</p>
          </div>
        ) : (
          <div className="tab-content">
            {/* TASKS LIST */}
            {activeTab === "tasks" && (
              <div className="dashboard-panel">
                <h2>Assigned Tasks</h2>
                {tasks.length === 0 ? (
                  <div className="empty-state">
                    <p>🎉 Excellent! No tasks have been assigned to you yet. Sit back or contact your Admin.</p>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {tasks.map((task) => {
                      // Attach feedback to task from submission if it exists
                      const taskSub = submissions.find(s => (s.taskId?._id || s.taskId) === task._id);
                      const taskWithFeedback = {
                        ...task,
                        feedback: taskSub ? taskSub.feedback : null
                      };

                      return (
                        <TaskCard
                          key={task._id}
                          task={taskWithFeedback}
                          role="intern"
                          onSubmitWork={handleOpenSubmitModal}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUBMISSIONS LIST */}
            {activeTab === "submissions" && (
              <div className="dashboard-panel">
                <h2>My Submissions</h2>
                {submissions.length === 0 ? (
                  <div className="empty-state">
                    <p>You haven't submitted any deliverables yet. Open "My Tasks" to submit work.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Task Title</th>
                          <th>Submitted URL</th>
                          <th>Review Status</th>
                          <th>Admin Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub) => (
                          <tr key={sub._id}>
                            <td>
                              <strong>{sub.taskId?.title || "Task"}</strong>
                            </td>
                            <td>
                              <a href={sub.workLink} target="_blank" rel="noopener noreferrer" className="external-link">
                                {sub.workLink} ↗
                              </a>
                            </td>
                            <td>
                              <span className={`status-text ${sub.taskId?.status || "Pending"}`}>
                                {sub.taskId?.status || "Pending"}
                              </span>
                            </td>
                            <td>
                              {sub.feedback ? (
                                <span className="feedback-text-view">{sub.feedback}</span>
                              ) : (
                                <em className="text-muted">Awaiting feedback</em>
                              )}
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

      {/* SUBMIT WORK MODAL */}
      {showSubmitModal && selectedTask && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Submit Task Deliverable</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  setShowSubmitModal(false);
                  setSelectedTask(null);
                  setWorkLink("");
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleWorkSubmit} className="modal-form">
              <div className="modal-body">
                <div className="task-preview-info">
                  <h3>{selectedTask.title}</h3>
                  <p>{selectedTask.description}</p>
                </div>

                <div className="form-group">
                  <label htmlFor="workLink">Link to your work (GitHub Repository / Live Demo)</label>
                  <input
                    type="url"
                    id="workLink"
                    value={workLink}
                    onChange={(e) => setWorkLink(e.target.value)}
                    required
                    placeholder="https://github.com/username/project"
                  />
                  <small className="help-text">
                    Make sure the link is public and accessible by the administrator.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedTask(null);
                    setWorkLink("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Work"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternDashboard;
