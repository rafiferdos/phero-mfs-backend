const SGetTotalBalanceFromDB = async () => {
  const userBalance = await user.aggregate([
    { $match: { accountType: 'user' } },
    { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
  ])
}