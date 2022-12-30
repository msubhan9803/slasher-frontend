async function cleanupNotifications(notificationsService, LIMIT_LATEST = 80) {
  const nots: any = await notificationsService.aggregate([
    { $sort: { createdAt: -1 } }, // latest date first
    {
      $group: {
        _id: '$userId',
        notifications: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        notifications: { $slice: ['$notifications', LIMIT_LATEST] }, // return first 80
      },
    },
  ]);
  // eslint-disable-next-line no-console
  // console.log(nots.map((n: any) => n.notifications.map((nf) => nf.createdAt)));

  // For each group of notifications, use the deleteMany() method to delete all the notifications except the latest 80
  for (const n of nots) {
    await notificationsService.deleteMany({
      userId: n._id,
      _id: { $nin: n.notifications.map((doc) => doc._id) },
    });
  }
}

export default cleanupNotifications;
