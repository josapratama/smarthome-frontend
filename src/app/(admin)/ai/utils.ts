export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "LOW":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

export const getRuleTypeColor = (type: string) => {
  switch (type) {
    case "automation":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "alert":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "optimization":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
};

export const getActiveStatusColor = (isActive: boolean) => {
  return isActive
    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
};
