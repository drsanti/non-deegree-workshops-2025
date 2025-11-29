# Workshop 04: Data Import and Export

**Duration:** 60-75 minutes  
**Level:** Beginner to Intermediate

## Introduction

Working with real data means importing it from various sources and exporting results. This workshop covers reading and writing data in common formats including CSV, Excel, JSON, and more. You'll learn how to handle different file formats, deal with common import issues, and export your analysis results.

## What You'll Learn

- Reading and writing CSV files
- Importing and exporting Excel files (using readxl and writexl)
- Working with JSON data
- Handling different file encodings
- Dealing with missing values during import
- Exporting data in various formats

## Prerequisites

Before starting, you should have:
- Completed Workshop 02: Data Structures in R
- Understanding of data frames
- R and RStudio installed

## Required Packages

Install the required packages first:

```r
install.packages(c("readxl", "writexl", "jsonlite", "readr"))
```

## Step-by-Step Instructions

### Step 1: Working with CSV Files

CSV (Comma-Separated Values) is one of the most common data formats:

```r
# Reading CSV files
data <- read.csv("data.csv")
data <- read.csv("data.csv", header = TRUE, sep = ",")

# Reading with readr (faster and more flexible)
library(readr)
data <- read_csv("data.csv")

# Specifying column types
data <- read_csv("data.csv", 
                 col_types = cols(
                   device_id = col_character(),
                   temperature = col_double(),
                   timestamp = col_datetime()
                 ))

# Writing CSV files
write.csv(data, "output.csv", row.names = FALSE)
write_csv(data, "output.csv")  # Using readr
```

### Step 2: Importing Excel Files

Excel files are common in business environments:

```r
library(readxl)

# Read first sheet
data <- read_excel("data.xlsx")

# Read specific sheet
data <- read_excel("data.xlsx", sheet = "Sheet1")
data <- read_excel("data.xlsx", sheet = 2)

# Read specific range
data <- read_excel("data.xlsx", range = "A1:D100")

# List all sheet names
excel_sheets("data.xlsx")

# Read multiple sheets
sheet1 <- read_excel("data.xlsx", sheet = 1)
sheet2 <- read_excel("data.xlsx", sheet = 2)
```

### Step 3: Exporting to Excel Files

Export your data to Excel format:

```r
library(writexl)

# Write single data frame
write_xlsx(data, "output.xlsx")

# Write multiple data frames to different sheets
write_xlsx(list("Sheet1" = data1, "Sheet2" = data2), "output.xlsx")

# Write with custom sheet names
write_xlsx(
  list("Temperature" = temp_data, "Humidity" = humidity_data),
  "sensor_data.xlsx"
)
```

### Step 4: Working with JSON Data

JSON is common for API responses and web data:

```r
library(jsonlite)

# Reading JSON from file
data <- fromJSON("data.json")

# Reading JSON from URL
data <- fromJSON("https://api.example.com/data")

# Reading JSON string
json_string <- '{"device_id": "IoT-001", "temperature": 25.5}'
data <- fromJSON(json_string)

# Writing JSON
json_data <- toJSON(data, pretty = TRUE)
write(json_data, "output.json")

# Writing data frame to JSON
write_json(data, "output.json", pretty = TRUE)
```

### Step 5: Handling Common Import Issues

Deal with common problems when importing data:

```r
# Handle missing values
data <- read.csv("data.csv", na.strings = c("", "NA", "NULL", "-"))

# Skip rows
data <- read.csv("data.csv", skip = 2)  # Skip first 2 rows

# Specify encoding
data <- read.csv("data.csv", fileEncoding = "UTF-8")

# Handle different decimal separators
data <- read.csv("data.csv", dec = ",")  # European format

# Read only specific columns
data <- read.csv("data.csv", 
                 colClasses = c("character", "numeric", "NULL", "numeric"))
```

### Step 6: Reading Text Files

Working with plain text files:

```r
# Read entire file as text
text <- readLines("data.txt")

# Read with specific encoding
text <- readLines("data.txt", encoding = "UTF-8")

# Read fixed-width files
data <- read.fwf("data.txt", widths = c(10, 5, 8))

# Write text file
writeLines(text, "output.txt")
```

### Step 7: Best Practices for Data Import

```r
# Check file exists before reading
if (file.exists("data.csv")) {
  data <- read.csv("data.csv")
} else {
  stop("File not found!")
}

# Check data after import
str(data)
head(data)
summary(data)

# Handle errors gracefully
tryCatch({
  data <- read.csv("data.csv")
}, error = function(e) {
  cat("Error reading file:", e$message, "\n")
})
```

## Exercises

1. **CSV Import/Export:**
   - Create a sample data frame with IoT sensor data
   - Export it to CSV
   - Read it back and verify the data

2. **Excel Operations:**
   - Create two data frames (temperature and humidity data)
   - Export both to an Excel file with separate sheets
   - Read the Excel file and verify both sheets

3. **JSON Handling:**
   - Create a nested list structure with device information
   - Convert it to JSON and save to file
   - Read it back and verify the structure

4. **Error Handling:**
   - Write a function that safely reads a CSV file
   - Handle cases where the file doesn't exist
   - Return a meaningful error message

## Summary

In this workshop, you've learned:
- How to read and write CSV files
- Importing and exporting Excel files
- Working with JSON data
- Handling common import issues
- Best practices for data import/export

## Next Steps

- Review the example code in `examples/04-data-import-export.r`
- Practice with your own data files
- Move on to Workshop 05: Data Manipulation with dplyr

## Additional Resources

- readr documentation: https://readr.tidyverse.org/
- readxl documentation: https://readxl.tidyverse.org/
- jsonlite documentation: https://github.com/jeroen/jsonlite
