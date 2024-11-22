import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import "../styles/ExpenseReport.css";

export default function ExpenseReport({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [totalDailyExpense, setTotalDailyExpense] = useState(0);
  const [totalMonthlyExpense, setTotalMonthlyExpense] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [selectedDate, user]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:5000/api/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(response.data);
      processExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const processExpenses = (data) => {
    processDailyExpenses(data);
    processMonthlyExpenses(data);
  };

  const processDailyExpenses = (data) => {
    const dailyExp = data.filter((exp) =>
      exp.created_at.startsWith(selectedDate)
    );
    setDailyExpenses(dailyExp);

    const total = dailyExp.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalDailyExpense(total);
  };

  const processMonthlyExpenses = (data) => {
    const startDate = startOfMonth(parseISO(selectedDate));
    const endDate = endOfMonth(parseISO(selectedDate));

    const monthExp = data.filter((exp) => {
      const expDate = parseISO(exp.created_at);
      return expDate >= startDate && expDate <= endDate;
    });

    const groupedExpenses = monthExp.reduce((acc, exp) => {
      const day = format(parseISO(exp.created_at), "dd");
      if (!acc[day]) acc[day] = { day, total: 0 };
      acc[day].total += exp.amount;
      return acc;
    }, {});

    const monthlyData = Object.values(groupedExpenses).sort(
      (a, b) => a.day - b.day
    );
    setMonthlyExpenses(monthlyData);

    const total = monthExp.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalMonthlyExpense(total);
  };

  return (
    <div className="container">
      <h1 style={{ fontFamily: "BarlowCondensed-Black" }}>Expense Tracker</h1>

      <div className="date-selector">
        <label htmlFor="date">Select Date: </label>&nbsp;&nbsp;
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <hr></hr>
      <div className="charts-container">
        <div className="chart">
          <h3>Daily Expenses</h3>
          <br />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyExpenses}>
              <XAxis dataKey="comment" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <div className="expense-summary">
            <h3>
              Total Daily Expense: {totalDailyExpense.toFixed(2)}{" "}
              {dailyExpenses[0]?.currency || ""}
            </h3>
          </div>
        </div>

        <div className="chart">
          <h3>Monthly Expenses</h3>
          <br />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyExpenses}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          <div className="expense-summary">
            <h3>
              Total Monthly Expense: {totalMonthlyExpense.toFixed(2)}{" "}
              {dailyExpenses[0]?.currency || ""}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
