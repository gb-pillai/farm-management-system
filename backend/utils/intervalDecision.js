function decideInterval(datasetDays, farmerDays) {
  datasetDays = Number(datasetDays);
  farmerDays = farmerDays ? Number(farmerDays) : undefined;

  if (!farmerDays) {
    return {
      finalDays: datasetDays,
      message: "Dataset interval used"
    };
  }

  const min = datasetDays * 0.7;
  const max = datasetDays * 1.5;

  if (farmerDays < min) {
    return {
      finalDays: datasetDays,
      message: "Farmer interval too short. Using recommended interval."
    };
  }

  if (farmerDays > max) {
    return {
      finalDays: farmerDays,
      message: "Interval accepted, but may affect yield."
    };
  }

  return {
    finalDays: farmerDays,
    message: "Farmer interval accepted."
  };
}

module.exports = decideInterval;
