import React from "react";

const TaskCard = ({ task, role, onSubmitWork, onReviewWork, onDeleteTask, onEditTask }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "Submitted":
        return "status-submitted";
      default:
        return "status-pending";
    }
  };

  const isOverdue = task.status !== "Completed" && task.deadline && new Date(task.deadline) < new Date();

  return (
    <div className={`task-card ${isOverdue ? "task-overdue" : ""}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`task-status-badge ${getStatusClass(task.status)}`}>
          {task.status}
        </span>
      </div>

      <p className="task-description">{task.description}</p>

      <div className="task-metadata">
        <div className="metadata-item">
          <span className="metadata-label">Deadline:</span>
          <span className={`metadata-value ${isOverdue ? "text-danger" : ""}`}>
            {formatDate(task.deadline)} {isOverdue && "(Overdue)"}
          </span>
        </div>

        {role === "admin" && task.assignedTo && (
          <div className="metadata-item">
            <span className="metadata-label">Assigned To:</span>
            <span className="metadata-value">
              {task.assignedTo.name} ({task.assignedTo.department || "No Dept"})
            </span>
          </div>
        )}
      </div>

      {/* Feedback from Admin if available */}
      {task.feedback && (
        <div className="task-feedback-box">
          <span className="feedback-title">Feedback:</span>
          <p className="feedback-content">{task.feedback}</p>
        </div>
      )}

      <div className="task-card-actions">
        {role === "intern" && task.status === "Pending" && (
          <button className="btn btn-primary btn-sm" onClick={() => onSubmitWork(task)}>
            Submit Work
          </button>
        )}

        {role === "intern" && task.status === "Submitted" && (
          <span className="info-text">Awaiting admin review</span>
        )}

        {role === "intern" && task.status === "Completed" && (
          <span className="info-text success-text">Approved & Finished</span>
        )}

        {role === "admin" && (
          <div className="admin-actions">
            {task.status === "Submitted" && onReviewWork && (
              <button className="btn btn-accent btn-sm" onClick={() => onReviewWork(task)}>
                Review Work
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => onEditTask(task)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDeleteTask(task._id)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
