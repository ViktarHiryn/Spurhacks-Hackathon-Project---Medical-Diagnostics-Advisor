import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Clock,
  Target,
  X,
  Calendar,
  Activity,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const TaskList = ({ onClose }) => {
  const { tasks, updateTask } = useUser();

  const toggleTaskComplete = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTask({
        ...task,
        completed: !task.completed,
        completedAt: task.completed ? null : new Date(),
      });
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case "exercise":
        return Activity;
      case "medication":
        return Clock;
      case "lifestyle":
        return Target;
      default:
        return Circle;
    }
  };

  const getTaskColor = (type) => {
    switch (type) {
      case "exercise":
        return "text-green-600 bg-green-100";
      case "medication":
        return "text-blue-600 bg-blue-100";
      case "lifestyle":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-neutral-600 bg-neutral-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const completedTasks = tasks.filter((task) => task.completed);
  const pendingTasks = tasks.filter((task) => !task.completed);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Health Tasks
            </h2>
            <p className="text-sm text-neutral-600">
              {pendingTasks.length} pending, {completedTasks.length} completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No tasks yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Complete a consultation to get personalized recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending Tasks
                </h3>
                <div className="space-y-3">
                  {pendingTasks.map((task, index) => {
                    const Icon = getTaskIcon(task.type);
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="mt-1 text-neutral-400 hover:text-primary-600 transition-colors"
                          >
                            <Circle className="w-5 h-5" />
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div
                                className={`p-1 rounded ${getTaskColor(
                                  task.type
                                )}`}
                              >
                                <Icon className="w-3 h-3" />
                              </div>
                              <h4 className="font-medium text-neutral-900">
                                {task.title}
                              </h4>
                              {task.priority && (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-neutral-600 mb-3">
                              {task.description}
                            </p>

                            {task.duration && (
                              <div className="flex items-center text-xs text-neutral-500 space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.duration}</span>
                                </div>
                                {task.frequency && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{task.frequency}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Completed Tasks
                </h3>
                <div className="space-y-3">
                  {completedTasks.map((task, index) => {
                    const Icon = getTaskIcon(task.type);
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-green-50 rounded-xl border border-green-200 p-4 opacity-75"
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="mt-1 text-green-600 hover:text-neutral-600 transition-colors"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div
                                className={`p-1 rounded bg-green-100 text-green-600`}
                              >
                                <Icon className="w-3 h-3" />
                              </div>
                              <h4 className="font-medium text-green-900 line-through">
                                {task.title}
                              </h4>
                            </div>

                            <p className="text-sm text-green-700 mb-2">
                              {task.description}
                            </p>

                            {task.completedAt && (
                              <div className="text-xs text-green-600">
                                Completed{" "}
                                {task.completedAt.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
