"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
} from "recharts";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const adminPin = "1234";

export default function DashboardPage() {
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [name, setName] = useState("");

  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");

  useEffect(() => {
    const savedPeople = JSON.parse(localStorage.getItem("people")) || [];
    setPeople(savedPeople);
    if (savedPeople.length > 0) selectPerson(savedPeople[0]);
  }, []);

  const selectPerson = (p) => {
    setSelectedPerson(p);
    const savedTasks = JSON.parse(localStorage.getItem("tasks_" + p.id)) || [];
    setTasks(savedTasks);
  };

  const checkAdmin = () => {
    if (prompt("Admin PIN") !== adminPin) {
      alert("Only admin can perform this action");
      return false;
    }
    return true;
  };

  const savePeople = (list) => {
    setPeople(list);
    localStorage.setItem("people", JSON.stringify(list));
  };

  const saveTasks = (list) => {
    setTasks(list);
    if (selectedPerson) {
      localStorage.setItem("tasks_" + selectedPerson.id, JSON.stringify(list));
    }
  };

  const isExpired = (t) =>
    !t.completed && new Date(t.submissionDate) < new Date();

  const addPerson = () => {
    if (!name.trim() || !checkAdmin()) return;
    const newPerson = { id: Date.now(), name };
    savePeople([...people, newPerson]);
    setName("");
    selectPerson(newPerson);
  };

  const addTask = () => {
    if (!taskName || !submissionDate || !checkAdmin()) return;
    saveTasks([
      ...tasks,
      {
        id: Date.now(),
        name: taskName,
        description: taskDesc,
        submissionDate,
        completed: false,
        late: false,
        showMore: false,
      },
    ]);
    setTaskName("");
    setTaskDesc("");
    setSubmissionDate("");
  };

  const updateTask = (id, updates) => {
    if (!checkAdmin()) return;
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id) => {
    if (!checkAdmin()) return;
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  const completed = tasks.filter((t) => t.completed && !t.late).length;
  const late = tasks.filter((t) => t.completed && t.late).length;
  const pending = tasks.filter((t) => !t.completed).length;

  const barData = [
    { name: "Completed", value: completed },
    { name: "Late", value: late },
    { name: "Pending", value: pending },
  ];

  const progressPercent =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Student Task Dashboard
        </h1>

        {/* Add Student */}
        <Card title="Add Student">
          <div className="flex gap-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={addPerson}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Add
            </button>
          </div>
        </Card>

        {selectedPerson && (
          <>
            {/* Add Task + Pie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title={`Add Task • ${selectedPerson.name}`}>
                <div className="space-y-2">
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Task name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                  />
                  <textarea
                    className="border p-2 rounded w-full"
                    placeholder="Description (optional)"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                  />
                  <input
                    type="date"
                    className="border p-2 rounded w-full"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                  />
                  <button
                    onClick={addTask}
                    className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                  >
                    Add Task
                  </button>
                </div>
              </Card>

              <Card title="Student Progress">
                <div className="flex flex-col items-center">
                  <PieChart width={200} height={200}>
                    <Pie
                      data={barData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                    >
                      <Cell fill="#16a34a" />
                      <Cell fill="#facc15" />
                      <Cell fill="#dc2626" />
                    </Pie>
                  </PieChart>
                  <p className="text-sm text-gray-500">Completion</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {progressPercent}%
                  </p>
                </div>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBox title="Total Tasks" value={tasks.length} />
              <StatBox
                title="Completed"
                value={completed}
                color="text-green-600"
              />
              <StatBox title="Pending" value={pending} color="text-red-600" />
              <StatBox title="Late" value={late} color="text-yellow-600" />
            </div>

            {/* Main */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Students */}
              <Card title="Students">
                <div className="space-y-2 max-h-72 overflow-auto">
                  {people.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => selectPerson(p)}
                      className={`border rounded p-2 flex justify-between items-center cursor-pointer transition-all duration-300 ${
                        selectedPerson.id === p.id
                          ? "border-2 border-blue-800 shadow-lg shadow-blue-500/50"
                          : "border border-gray-300"
                      }`}
                    >
                      <span>{p.name}</span>
                      <FiTrash2
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePerson(p);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Bar Graph */}
              <Card title="Progress">
                <ResponsiveContainer width="100%" height={280}>
  <BarChart data={barData}>
    <defs>
      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
      <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="rgba(0,0,0,0.06)" />

    <XAxis
      dataKey="name"
      tick={{ fill: "#374151", fontSize: 13, fontWeight: 500 }}
      axisLine={false}
      tickLine={false}
    />

    <YAxis
      allowDecimals={false}
      tick={{ fill: "#6b7280", fontSize: 12 }}
      axisLine={false}
      tickLine={false}
    />

    <Tooltip
      cursor={{ fill: "rgba(59,130,246,0.08)" }}
      contentStyle={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(6px)",
        borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        fontSize: "13px",
      }}
    />

    <Bar
      dataKey="value"
      radius={[14, 14, 6, 6]}
      barSize={46}
      animationDuration={900}
    >
      {barData.map((entry, index) => (
        <Cell
          key={index}
          fill={
            entry.name === "Completed"
              ? "url(#completedGradient)"
              : entry.name === "Pending"
              ? "url(#pendingGradient)"
              : "url(#lateGradient)"
          }
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>

              </Card>

              {/* Tasks */}
              <Card title={`Task • ${selectedPerson.name}`}>
                <div className="space-y-3 max-h-72 overflow-auto">
                  {tasks.map((t) => (
                    <div key={t.id} className="border p-3 rounded">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm">Due: {t.submissionDate}</p>

                      {t.description && (
                        <>
                          <p className="text-sm text-gray-600">
                            {t.showMore
                              ? t.description
                              : t.description.slice(0, 35)}
                          </p>
                          {t.description.length > 35 && (
                            <button
                              className="text-blue-600 text-xs"
                              onClick={() =>
                                updateTask(t.id, {
                                  showMore: !t.showMore,
                                })
                              }
                            >
                              {t.showMore ? "Less" : "More"}
                            </button>
                          )}
                        </>
                      )}

                      <div className="flex mt-2">
                        {!t.completed && (
                          <button
                            onClick={() =>
                              updateTask(t.id, {
                                completed: true,
                                late: isExpired(t),
                              })
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="ml-auto text-red-600"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function StatBox({ title, value, color = "text-gray-800" }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
