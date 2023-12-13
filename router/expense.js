const express = require('express');
const router = express.Router();

const {
  addExpense,
  editExpense,
  deleteExpense,
  getLbUsersExpenses,
  generateReport,
  getExpensePagination,
} = require('../controller/expense');
const { authUser } = require('../middleware/authMiddleware');
const isPremium = require('../middleware/isPremium');

router.post('/add-expense', authUser, addExpense);

router.put('/edit-expense/:id', authUser, editExpense);

router.delete('/delete-expense/:id', authUser, deleteExpense);

router.get(
  '/lb-users-expenses',
  authUser,
  isPremium.isPremiumUser,
  getLbUsersExpenses
);

router.get('/generatereport', authUser, generateReport);

router.use('/', authUser, getExpensePagination);

module.exports = router;
