'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_PREP_TASKS, PREP_TASK_CATEGORIES, type PrepTaskCategory, type PreparationTask } from '@/types';

interface PreparationChecklistProps {
  tasks: PreparationTask[];
  onAddTask: (taskText: string, category: PrepTaskCategory) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onAddDefaultTasks: () => void;
  hasKids?: boolean;
}

export function PreparationChecklist({
  tasks,
  onAddTask,
  onToggleTask,
  onAddDefaultTasks,
  hasKids = true,
}: PreparationChecklistProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<PrepTaskCategory>('planning');
  const [filterCategory, setFilterCategory] = useState<PrepTaskCategory | 'all'>('all');

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const filteredTasks = filterCategory === 'all'
    ? tasks
    : tasks.filter((t) => t.category === filterCategory);

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim(), newTaskCategory);
      setNewTaskText('');
      setShowAddForm(false);
    }
  };

  // Group suggested tasks by category for easier browsing
  const suggestedTasks = DEFAULT_PREP_TASKS.filter(
    (dt) => !tasks.some((t) => t.taskText === dt.text) && (hasKids || !dt.forKids)
  );

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">قائمة التحضير</h2>
          <p className="text-sm text-gray-500">استعدوا لرمضان معاً</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">
            {completedCount}/{tasks.length}
          </div>
          <div className="text-xs text-gray-500">مكتملة</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Empty state - show default tasks suggestion */}
      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center"
        >
          <div className="mb-3 text-4xl">📋</div>
          <h3 className="mb-2 font-semibold text-gray-900">ابدأ التحضير</h3>
          <p className="mb-4 text-sm text-gray-600">
            جهزنا بعض المهام الممتعة لمساعدة عائلتك على الاستعداد لرمضان!
          </p>
          <button
            onClick={onAddDefaultTasks}
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            أضف المهام المقترحة
          </button>
        </motion.div>
      )}

      {/* Category filter */}
      {tasks.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          <FilterButton
            active={filterCategory === 'all'}
            onClick={() => setFilterCategory('all')}
            label="الكل"
            icon="📝"
          />
          {(Object.keys(PREP_TASK_CATEGORIES) as PrepTaskCategory[]).map((cat) => (
            <FilterButton
              key={cat}
              active={filterCategory === cat}
              onClick={() => setFilterCategory(cat)}
              label={PREP_TASK_CATEGORIES[cat].label}
              icon={PREP_TASK_CATEGORIES[cat].icon}
            />
          ))}
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(completed) => onToggleTask(task.id, completed)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add task form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-2xl bg-gray-50 p-4">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="ماذا تحتاج للتحضير؟"
                className="mb-3 w-full rounded-xl border-0 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <div className="mb-3 flex flex-wrap gap-2">
                {(Object.keys(PREP_TASK_CATEGORIES) as PrepTaskCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewTaskCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      newTaskCategory === cat
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    {PREP_TASK_CATEGORIES[cat].icon} {PREP_TASK_CATEGORIES[cat].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-xl bg-gray-200 py-2 text-sm font-medium text-gray-700"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskText.trim()}
                  className="flex-1 rounded-xl bg-purple-500 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  إضافة مهمة
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add task button */}
      {!showAddForm && tasks.length > 0 && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-purple-300 hover:text-purple-600"
        >
          <span>+</span>
          إضافة مهمة مخصصة
        </button>
      )}

      {/* Suggested tasks (if they have tasks but there are still suggestions) */}
      {tasks.length > 0 && suggestedTasks.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="mb-3 text-sm font-medium text-gray-500">أفكار أخرى</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedTasks.slice(0, 6).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onAddTask(suggestion.text, suggestion.category)}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-700"
              >
                {PREP_TASK_CATEGORIES[suggestion.category].icon} {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-purple-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function TaskItem({
  task,
  onToggle,
}: {
  task: PreparationTask;
  onToggle: (completed: boolean) => void;
}) {
  const category = PREP_TASK_CATEGORIES[task.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${
        task.isCompleted ? 'bg-emerald-50' : 'bg-gray-50'
      }`}
    >
      <button
        onClick={() => onToggle(!task.isCompleted)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.isCompleted
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-gray-300 hover:border-purple-400'
        }`}
      >
        {task.isCompleted && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </button>

      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}
        >
          {task.taskText}
        </p>
      </div>

      <span
        className={`rounded-full px-2 py-0.5 text-xs bg-gradient-to-r ${category.color} text-white`}
      >
        {category.icon}
      </span>
    </motion.div>
  );
}
