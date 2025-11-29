# Workshop 04: Data Import and Export
# This script demonstrates reading and writing data in various formats

# Note: This script creates sample files for demonstration
# In practice, you would read existing files

# Install and load required libraries
# Install packages if not already installed
optional_packages <- c("readr", "readxl", "writexl", "jsonlite", "zoo")
for (pkg in optional_packages) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    cat("Installing", pkg, "package (optional)...\n")
    install.packages(pkg)
  }
}

# ============================================================================
# Setup: Create Sample Data
# ============================================================================

cat("=== Creating Sample Data ===\n")

# Create sample IoT sensor data
set.seed(123)
sample_data <- data.frame(
  device_id = paste0("IoT-", sprintf("%03d", 1:10)),
  timestamp = seq(as.POSIXct("2024-01-01 00:00:00"), by = "1 hour", length.out = 10),
  temperature = round(rnorm(10, mean = 25, sd = 2), 2),
  humidity = round(runif(10, 40, 60), 1),
  pressure = round(rnorm(10, mean = 1013, sd = 5), 1),
  status = sample(c("online", "offline"), 10, replace = TRUE)
)

cat("Sample Data:\n")
print(sample_data)

# ============================================================================
# 1. Working with CSV Files
# ============================================================================

cat("\n=== CSV Files ===\n")

# Write CSV using base R
write.csv(sample_data, "temp_sensor_data.csv", row.names = FALSE)
cat("CSV file written using write.csv\n")

# Read CSV using base R
data_csv <- read.csv("temp_sensor_data.csv")
cat("\nData read from CSV (first 5 rows):\n")
print(head(data_csv, 5))

# Using readr package (if available)
if (require(readr, quietly = TRUE)) {
  # Write CSV using readr
  write_csv(sample_data, "temp_sensor_data_readr.csv")
  cat("\nCSV file written using readr::write_csv\n")

  # Read CSV using readr
  data_readr <- read_csv("temp_sensor_data_readr.csv",
    col_types = cols(
      device_id = col_character(),
      timestamp = col_datetime(),
      temperature = col_double(),
      humidity = col_double(),
      pressure = col_double(),
      status = col_character()
    )
  )
  cat("\nData read from CSV using readr (first 5 rows):\n")
  print(head(data_readr, 5))
} else {
  cat("\nreadr package not installed. Install with: install.packages('readr')\n")
}

# ============================================================================
# 2. Importing Excel Files
# ============================================================================

cat("\n=== Excel Files ===\n")

# Check if readxl is available
if (require(readxl, quietly = TRUE)) {
  # Note: In practice, you would read existing Excel files
  # For demonstration, we'll show the syntax

  cat("To read Excel files, use:\n")
  cat("  library(readxl)\n")
  cat("  data <- read_excel('data.xlsx')\n")
  cat("  data <- read_excel('data.xlsx', sheet = 'Sheet1')\n")
  cat("  data <- read_excel('data.xlsx', sheet = 2)\n")
  cat("  data <- read_excel('data.xlsx', range = 'A1:D100')\n")

  # List sheets (if file exists)
  # excel_sheets("data.xlsx")
} else {
  cat("readxl package not installed. Install with: install.packages('readxl')\n")
  cat("Then use: library(readxl)\n")
  cat("  data <- read_excel('data.xlsx')\n")
}

# ============================================================================
# 3. Exporting to Excel Files
# ============================================================================

cat("\n=== Exporting to Excel ===\n")

# Check if writexl is available
if (require(writexl, quietly = TRUE)) {
  # Create multiple data frames for demonstration
  temp_data <- sample_data[, c("device_id", "timestamp", "temperature")]
  humidity_data <- sample_data[, c("device_id", "timestamp", "humidity")]

  # Write single data frame
  write_xlsx(sample_data, "temp_sensor_data.xlsx")
  cat("Excel file written: temp_sensor_data.xlsx\n")

  # Write multiple data frames to different sheets
  write_xlsx(
    list(
      "All Data" = sample_data,
      "Temperature" = temp_data,
      "Humidity" = humidity_data
    ),
    "temp_sensor_data_multi.xlsx"
  )
  cat("Multi-sheet Excel file written: temp_sensor_data_multi.xlsx\n")
} else {
  cat("writexl package not installed. Install with: install.packages('writexl')\n")
  cat("Then use: library(writexl)\n")
  cat("  write_xlsx(data, 'output.xlsx')\n")
}

# ============================================================================
# 4. Working with JSON Data
# ============================================================================

cat("\n=== JSON Data ===\n")

# Check if jsonlite is available
if (require(jsonlite, quietly = TRUE)) {
  # Create nested structure
  device_list <- list(
    devices = list(
      list(device_id = "IoT-001", temperature = 25.5, status = "online"),
      list(device_id = "IoT-002", temperature = 23.2, status = "online"),
      list(device_id = "IoT-003", temperature = 24.8, status = "offline")
    ),
    metadata = list(
      timestamp = as.character(Sys.time()),
      total_devices = 3
    )
  )

  # Convert to JSON
  json_string <- toJSON(device_list, pretty = TRUE)
  cat("JSON String:\n")
  cat(json_string, "\n")

  # Write JSON to file
  write(json_string, "temp_devices.json")
  cat("\nJSON file written: temp_devices.json\n")

  # Read JSON from file
  json_data <- fromJSON("temp_devices.json")
  cat("\nData read from JSON:\n")
  print(json_data)

  # Convert data frame to JSON
  df_json <- toJSON(sample_data, pretty = TRUE)
  write(df_json, "temp_sensor_data.json")
  cat("\nData frame exported to JSON: temp_sensor_data.json\n")
} else {
  cat("jsonlite package not installed. Install with: install.packages('jsonlite')\n")
}

# ============================================================================
# 5. Handling Common Import Issues
# ============================================================================

cat("\n=== Handling Import Issues ===\n")

# Create CSV with missing values for demonstration
data_with_na <- sample_data
data_with_na$temperature[3] <- NA
data_with_na$humidity[5] <- ""
write.csv(data_with_na, "temp_data_with_na.csv", row.names = FALSE)

# Read with na.strings specification
data_clean <- read.csv("temp_data_with_na.csv",
  na.strings = c("", "NA", "NULL", "-")
)
cat("Data with NA handling:\n")
print(head(data_clean, 5))
cat("\nMissing values:\n")
print(summary(data_clean))

# ============================================================================
# 6. Reading Text Files
# ============================================================================

cat("\n=== Text Files ===\n")

# Create sample text file
text_content <- c(
  "Device Readings Log",
  "===================",
  "IoT-001: Temperature 25.5°C",
  "IoT-002: Temperature 23.2°C",
  "IoT-003: Temperature 24.8°C"
)
writeLines(text_content, "temp_log.txt")

# Read text file
text_lines <- readLines("temp_log.txt")
cat("Text file content:\n")
for (line in text_lines) {
  cat(line, "\n")
}

# ============================================================================
# 7. Best Practices for Data Import
# ============================================================================

cat("\n=== Best Practices ===\n")

# Function to safely read CSV
safe_read_csv <- function(filename) {
  if (!file.exists(filename)) {
    stop(paste("File not found:", filename))
  }

  tryCatch(
    {
      data <- read.csv(filename, stringsAsFactors = FALSE)
      cat("Successfully read", nrow(data), "rows from", filename, "\n")
      return(data)
    },
    error = function(e) {
      cat("Error reading file:", e$message, "\n")
      return(NULL)
    }
  )
}

# Test the function
cat("\nTesting safe_read_csv function:\n")
result <- safe_read_csv("temp_sensor_data.csv")
if (!is.null(result)) {
  cat("Data structure:\n")
  str(result)
}

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: CSV Import/Export ===\n")
# Create sample data
exercise1_data <- data.frame(
  device_id = c("D001", "D002", "D003"),
  temperature = c(22.5, 24.3, 21.8),
  humidity = c(45, 52, 48)
)

# Export to CSV
write.csv(exercise1_data, "exercise1_data.csv", row.names = FALSE)
cat("Data exported to CSV\n")

# Read back
exercise1_read <- read.csv("exercise1_data.csv")
cat("Data read back:\n")
print(exercise1_read)

cat("\n=== Exercise 2: Excel Operations ===\n")
if (require(writexl, quietly = TRUE) && require(readxl, quietly = TRUE)) {
  temp_df <- data.frame(
    device_id = c("D001", "D002"),
    temperature = c(22.5, 24.3)
  )

  humidity_df <- data.frame(
    device_id = c("D001", "D002"),
    humidity = c(45, 52)
  )

  write_xlsx(
    list("Temperature" = temp_df, "Humidity" = humidity_df),
    "exercise2_data.xlsx"
  )
  cat("Excel file created with 2 sheets\n")

  # Read back
  temp_read <- read_excel("exercise2_data.xlsx", sheet = "Temperature")
  humidity_read <- read_excel("exercise2_data.xlsx", sheet = "Humidity")
  cat("Temperature sheet:\n")
  print(temp_read)
  cat("\nHumidity sheet:\n")
  print(humidity_read)
}

cat("\n=== Exercise 3: JSON Handling ===\n")
if (require(jsonlite, quietly = TRUE)) {
  device_info <- list(
    device1 = list(id = "D001", temp = 22.5, status = "online"),
    device2 = list(id = "D002", temp = 24.3, status = "online")
  )

  json_output <- toJSON(device_info, pretty = TRUE)
  write(json_output, "exercise3_data.json")
  cat("JSON file created\n")

  # Read back
  json_read <- fromJSON("exercise3_data.json")
  cat("Data read from JSON:\n")
  print(json_read)
}

cat("\n=== Exercise 4: Error Handling ===\n")
safe_read <- function(filename) {
  if (!file.exists(filename)) {
    return(paste("Error: File", filename, "does not exist"))
  }

  tryCatch(
    {
      data <- read.csv(filename)
      return(paste("Success: Read", nrow(data), "rows"))
    },
    error = function(e) {
      return(paste("Error:", e$message))
    }
  )
}

cat(safe_read("temp_sensor_data.csv"), "\n")
cat(safe_read("nonexistent_file.csv"), "\n")

# Cleanup message
cat("\n=== Cleanup ===\n")
cat("Temporary files created for demonstration:\n")
cat("- temp_sensor_data.csv\n")
cat("- temp_sensor_data.xlsx (if writexl installed)\n")
cat("- temp_devices.json (if jsonlite installed)\n")
cat("- temp_log.txt\n")
cat("You can delete these files after reviewing.\n")
