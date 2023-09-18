const Expense = require("../model/Expense");
const User = require("../model/User");
const sequelize = require("../utils/database");

// @desc    getting all expenses
// @route   GET /expense/
// @access  Private
exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await req.user.getExpenses();
    return res.json({
      userName: req.user.name,
      isPremium: req.user.isPremium,
      expenses: expenses,
    });
  } catch (error) {
    console.log({ Error: "Something Wrong", error });
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

// @desc    getting all expenses
// @route   GET /expense/
// @access  Private
exports.generateReport = async (req, res, next) => {
  try {
    const expenses = await req.user.getExpenses({
      attributes: ["createdAt", "description", "category", "amount"],
      order: [["createdAt", "DESC"]],
    });
    return res.json({
      userName: req.user.name,
      isPremium: req.user.isPremium,
      expenses,
    });
  } catch (error) {
    console.log({ Error: "Something Wrong", error });
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

// @desc    Add New Expense
// @route   POST /expense/add-expense
// @access  Private
exports.addExpense = async (req, res, next) => {
  const { amount, description, category } = req.body;
  const t = await sequelize.transaction();
  try {
    const expense = await req.user.createExpense(
      {
        amount,
        description,
        category,
      },
      { transaction: t }
    );
    const user = await User.findOne(
      { where: { id: req.user.id } },
      { transaction: t }
    );
    let newTotal = user.allExpenses + amount;

    await user.update({ allExpenses: newTotal }, { transaction: t });
    await t.commit();
    res.status(200).json({ expense, isPremium: user.isPremium });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

// @desc    Edit An Expense
// @route   PUT /expense/edit-expense/:id
// @access  Private
exports.editExpense = async (req, res, next) => {
  const { id } = req.params;
  const { amount, description, category } = req.body;
  const t = await sequelize.transaction();

  try {
    const exp = await Expense.findOne({ where: { id } }, { transaction: t });
    const user = await User.findOne(
      { where: { id: req.user.id } },
      { transaction: t }
    );

    let newTotal = user.allExpenses - exp.amount + +amount;
    await User.update(
      { allExpenses: newTotal },
      { where: { id: req.user.id } },
      { transaction: t }
    );

    await Expense.update(
      { amount, description, category },
      { where: { id: id } },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json({
      id,
      amount,
      description,
      category,
      isPremium: user.isPremium,
    });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

// @desc    Delete An Expense
// @route   DELETE /expense/delete-expense/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const expense = await Expense.findOne(
      { where: { id } },
      { transaction: t }
    );
    const user = await User.findOne(
      { where: { id: req.user.id } },
      { transaction: t }
    );

    let newTotal = user.allExpenses - expense.amount;
    if (newTotal < 0) newTotal = 0;
    const updateUser = await user.update(
      { allExpenses: newTotal },
      { transaction: t }
    );
    await expense.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ expense, isPremium: updateUser.isPremium });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

// @desc    Getting All LB Users List
// @route   GET /expense/lb-users-expenses
// @access  Private
exports.getLbUsersExpenses = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "allExpenses"],
      order: [["allExpenses", "DESC"]],
    });

    return res.json({
      status: "Success",
      users: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ Error: "Something Wrong", error });
  }
};

// @desc    Getting All LB Users List
// @route   GET /expense?page=pagenumber
// @access  Private
exports.getExpensePagination = async (req, res, next) => {
  try {
    // console.log(req.query);
    const ITEM_PER_PAGE = +req.query.limit || 4;
    const page = +req.query.page || 1;
    let totalExpenses = await Expense.count({ where: { userId: req.user.id } });

    const expenses = await req.user.getExpenses({
      offset: (page - 1) * ITEM_PER_PAGE,
      limit: ITEM_PER_PAGE,
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      status: "Success",
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
    return res.status(400).json({ Error: "Something Wrong", error });
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
