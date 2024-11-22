import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import "../styles/ExpenseForm.css";
import { Link, useNavigate } from "react-router-dom";
export default function ExpenseForm({
  user,
  setMonthlyExpenses,
  setTotalDailyExpense,
  setTotalMonthlyExpense,
}) {
  const [expenses, setExpenses] = useState([]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [expensesPerPage] = useState(4);
  const totalPage = Math.ceil(dailyExpenses.length / expensesPerPage);

  const lastPage = currentPage * expensesPerPage;
  const firstPage = lastPage - expensesPerPage;
  const paginationExpenses = dailyExpenses.slice(firstPage, lastPage);

  const prev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const next = () => {
    if (currentPage < totalPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/expenses/${editingId}`,
          {
            amount: Number(amount),
            currency,
            comment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/expenses",
          {
            amount: Number(amount),
            currency,
            comment,
            created_at: selectedDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setAmount("");
      setCurrency("");
      setComment("");
      setEditingId(null);
      fetchExpenses();
    } catch (error) {
      console.error("Error submitting expense:", error);
    }
  };

  const handleEdit = (expense) => {
    setAmount(expense.amount);
    setCurrency(expense.currency);
    setComment(expense.comment);
    setEditingId(expense._id);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <>
      <div className="Expcontain">
        <div className="expForm">
          <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <input
                id="currency"
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="Enter currency"
              />
            </div>
            <div className="form-group">
              <label htmlFor="comment">Comment</label>
              <input
                id="comment"
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter comment"
              />
            </div>
            <button type="submit" className="submit-btn">
              {editingId ? "Update" : "Add"} Expense
            </button>
          </form>
          <div className="cards back">
            <p>Go back to home page</p>
            <button onClick={handleGoBack} className="submit-btn">
              Go back
            </button>
          </div>
        </div>
        <div className="expList">
          <h2>Expenses for {format(parseISO(selectedDate), "MMMM d, yyyy")}</h2>
          {dailyExpenses.length === 0 ? (
            <p>No expenses recorded for this date.</p>
          ) : (
            <ul>
              {paginationExpenses.map((expense) => (
                <li key={expense._id}>
                  <div className="expense-item">
                    <p className="expense-comment">{expense.comment}</p>
                    <p className="expense-amount">
                      {expense.amount} {expense.currency}
                    </p>
                  </div>
                  <div className="expense-details">
                    <p>
                      {format(
                        parseISO(expense.created_at),
                        "eeee do MMM, yyyy"
                      )}
                    </p>
                    <div className="expense-actions">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="pages">
        <nav aria-label="Page navigation example">
          <ul class="pagination">
            <li class="page-item">
              <a
                class="page-link"
                onClick={prev}
                disabled={currentPage === 1}
                className={currentPage === 1 ? "disabled" : ""}
              >
                Previous
              </a>
            </li>
            <li class="page-item">
              <a
                class="page-link"
                onClick={next}
                disabled={currentPage === totalPage || totalPage === 0}
                className={
                  currentPage === totalPage || totalPage === 0 ? "disabled" : ""
                }
              >
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
