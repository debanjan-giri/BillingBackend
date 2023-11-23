// basic log information
// 11/19/2023, 9:39:20 AM GET /category/view
const logger = (req, res, next) => {
  console.log(
    `${new Date().toLocaleString()} ${req.method} ${req.originalUrl}`
  );
  next();
};

export default logger;
