const mongoose = require('mongoose');
const Expense = require('../model/Expense');
const User = require('../model/User');

// @desc    getting all expenses
// @route   GET /expense/
// @access  Private
exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    return res.json({
      userName: req.user.name,
      isPremium: req.user.isPremium,
      expenses: expenses,
    });
  } catch (error) {
    console.log({ Error: 'Something Wrong', error });
    return res.status(400).json({ Error: 'Something Wrong', error });
  }
};

// @desc    getting all expenses
// @route   GET /expense/generatereport
// @access  Private
exports.generateReport = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .select('-_id createdAt description category amount')
      .sort({
        createdAt: 'DESC',
      });
    return res.json({
      userName: req.user.name,
      isPremium: req.user.isPremium,
      expenses,
    });
  } catch (error) {
    console.log({ Error: 'Something Wrong', error });
    return res.status(400).json({ Error: 'Something Wrong', error });
  }
};

// @desc    Add New Expense
// @route   POST /expense/add-expense
// @access  Private
exports.addExpense = async (req, res, next) => {
  const { amount, description, category } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const expense = new Expense({
      amount,
      description,
      category,
      userId: req.user._id,
    });

    req.user.allExpenses += amount;
    req.user.expenses.push(expense._id);

    await Promise.all([
      expense.save({ session }),
      req.user.save({ session }),
      new Error('custome error'),
    ]);

    // throw new Error("custome error");

    await session.commitTransaction();
    return res.status(200).json({ expense, isPremium: req.user.isPremium });
  } catch (error) {
    await session.abortTransaction();
    console.log(
      'expense.js line 68'.underline.red,
      error.message.underline.red
    );
    return res.status(400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

// @desc    Edit An Expense
// @route   PUT /expense/edit-expense/:id
// @access  Private
exports.editExpense = async (req, res, next) => {
  const { id } = req.params;
  const { amount, description, category } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const exp = await Expense.findOne({ _id: id });

    // updating curr user
    req.user.allExpenses = req.user.allExpenses - exp.amount + +amount;

    // updating expense Data
    exp.amount = amount;
    exp.description = description;
    exp.category = category;
    exp.userId = req.user._id;

    // saving both user and expense parallelly
    await Promise.all([req.user.save({ session }), exp.save({ session })]);

    // throw new Error("custom error");

    await session.commitTransaction();

    return res.status(200).json({
      _id: id,
      amount,
      description,
      category,
      isPremium: req.user.isPremium,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error.message.underline.red);
    return res.status(400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

// @desc    Delete An Expense
// @route   DELETE /expense/delete-expense/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const expense = await Expense.findOne({ _id: id });

    req.user.allExpenses -= expense.amount;
    if (req.user.allExpenses < 0) req.user.allExpenses = 0;

    const newExpenses = req.user.expenses.filter(
      (e) => e.toString() !== id.toString()
    );

    req.user.expenses = newExpenses;

    // saving user and deleting expense parallelly using Promise.all
    await Promise.all([
      req.user.save({ session }),
      Expense.deleteOne({ _id: id }, { session }),
    ]);

    // throw new Error("custome error");

    await session.commitTransaction();
    return res.status(200).json({ expense, isPremium: req.user.isPremium });
  } catch (error) {
    await session.abortTransaction();
    console.log(error.message.underline.red);
    return res.status(400).json({ Error: 'Something Wrong', error });
  } finally {
    await session.endSession();
  }
};

// @desc    Getting All LB Users List
// @route   GET /expense/lb-users-expenses
// @access  Private
exports.getLbUsersExpenses = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('_id name allExpenses')
      .sort({ allExpenses: 'DESC' });

    return res.json({
      status: 'Success',
      users: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: 'Something Wrong', error });
  }
};

// @desc    Getting All LB Users List
// @route   GET /expense?page=pagenumber
// @access  Private
exports.getExpensePagination = async (req, res, next) => {
  try {
    const ITEM_PER_PAGE = +req.query.limit || 4;
    const page = +req.query.page || 1;
    let totalExpenses = await Expense.count({ userId: req.user._id });
    // console.log(totalExpenses);
    const expenses = await Expense.find({ userId: req.user._id })
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE)
      .sort({ createdAt: 'DESC' });

    // const exps = await req.user.populate("expenses");
    // console.log(exps.expenses);

    return res.json({
      status: 'Success',
      userName: req.user.name,
      isPremium: req.user.isPremium,
      userTotalExpense: req.user.allExpenses,
      expenses,
      currentPage: page,
      hasNextPage: ITEM_PER_PAGE * page < totalExpenses,
      naxtPage: page + 1,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalExpenses / ITEM_PER_PAGE),
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: 'Something Wrong', error });
  }
};

// exports.updatedLbUsers = async (req, res, next) => {
//   try {
//     const user = await User.findOne({
//       where: { id: req.user.id },
//       attributes: ["id", "name", "allExpenses"],
//       order: [["allExpenses", "DESC"]],
//     });

//     return res.json({
//       status: "Success",
//       user: user,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ Error: "Something Wrong", error });
//   }
// };
