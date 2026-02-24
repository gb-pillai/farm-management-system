function decideInterval(baseDays, farmerDays) {
  baseDays = Number(baseDays);
  farmerDays = farmerDays ? Number(farmerDays) : undefined;

  if (!farmerDays) {
    return {
      finalDays: baseDays,
      message: "Recommended interval used."
    };
  }

  if (farmerDays < baseDays) {
    return {
      finalDays: baseDays,
      message: "Farmer interval too short. Using safe minimum interval."
    };
  }

  return {
    finalDays: farmerDays,
    message: "Farmer interval accepted."
  };
}

module.exports = decideInterval;