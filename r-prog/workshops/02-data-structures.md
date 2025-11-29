# Workshop 02: Data Structures in R

**Duration:** 60-75 minutes  
**Level:** Beginner

## Introduction

Understanding data structures is crucial for effective R programming. In this workshop, you'll learn about vectors, lists, matrices, arrays, and data frames - the fundamental data structures that R uses to organize and manipulate data. These structures are essential for working with IoT sensor data and any real-world dataset.

## What You'll Learn

- Creating and manipulating vectors
- Working with lists (heterogeneous collections)
- Understanding matrices and arrays
- Creating and manipulating data frames
- Working with factors for categorical data
- Indexing and subsetting techniques

## Prerequisites

Before starting, you should have:
- Completed Workshop 01: R Programming Fundamentals
- Basic understanding of R variables and functions
- R and RStudio installed

## Step-by-Step Instructions

### Step 1: Vectors - The Foundation

Vectors are one-dimensional arrays that can hold numeric, character, or logical data:

```r
# Creating vectors
numeric_vec <- c(1, 2, 3, 4, 5)
character_vec <- c("Sensor1", "Sensor2", "Sensor3")
logical_vec <- c(TRUE, FALSE, TRUE)

# Using sequence operator
seq_vec <- 1:10
seq_vec2 <- seq(1, 10, by = 2)  # 1, 3, 5, 7, 9

# Vector operations
vec1 <- c(1, 2, 3)
vec2 <- c(4, 5, 6)
vec_sum <- vec1 + vec2  # Element-wise addition
vec_prod <- vec1 * vec2  # Element-wise multiplication

# Vector functions
length(numeric_vec)
sum(numeric_vec)
mean(numeric_vec)
```

### Step 2: Lists - Heterogeneous Collections

Lists can contain elements of different types:

```r
# Creating a list
device_info <- list(
  device_id = "IoT-001",
  temperature = 25.5,
  is_active = TRUE,
  sensors = c("temp", "humidity", "pressure")
)

# Accessing list elements
device_info$device_id
device_info[[1]]
device_info[["temperature"]]

# Nested lists
nested_list <- list(
  device1 = list(id = "D001", status = "online"),
  device2 = list(id = "D002", status = "offline")
)
```

### Step 3: Matrices - Two-Dimensional Arrays

Matrices are two-dimensional arrays with rows and columns:

```r
# Creating matrices
matrix1 <- matrix(1:12, nrow = 3, ncol = 4)
matrix2 <- matrix(1:12, nrow = 3, ncol = 4, byrow = TRUE)

# Matrix with row and column names
sensor_data <- matrix(
  c(22, 24, 23, 25, 21, 22),
  nrow = 2,
  ncol = 3,
  dimnames = list(
    c("Morning", "Evening"),
    c("Sensor1", "Sensor2", "Sensor3")
  )
)

# Accessing matrix elements
sensor_data[1, 2]  # Row 1, Column 2
sensor_data[1, ]    # Entire first row
sensor_data[, 2]    # Entire second column

# Matrix operations
matrix1 + matrix2  # Element-wise addition
matrix1 * matrix2  # Element-wise multiplication
t(matrix1)         # Transpose
```

### Step 4: Arrays - Multi-Dimensional Structures

Arrays extend matrices to more than two dimensions:

```r
# Creating a 3D array
array_data <- array(1:24, dim = c(2, 3, 4))

# Accessing array elements
array_data[1, 2, 3]  # First dimension, second row, third column
```

### Step 5: Data Frames - The Workhorse of R

Data frames are the most important structure for data analysis - like Excel spreadsheets:

```r
# Creating a data frame
iot_data <- data.frame(
  device_id = c("D001", "D002", "D003", "D004"),
  temperature = c(22.5, 24.3, 21.8, 25.1),
  humidity = c(45, 52, 48, 55),
  status = c("online", "online", "offline", "online")
)

# Viewing data frame
head(iot_data)
str(iot_data)  # Structure
summary(iot_data)  # Summary statistics

# Accessing columns
iot_data$temperature
iot_data[["humidity"]]
iot_data[, 2]  # Second column

# Accessing rows
iot_data[1, ]  # First row
iot_data[1:3, ]  # First three rows

# Adding new columns
iot_data$pressure <- c(1013, 1015, 1012, 1014)

# Subsetting data frames
subset(iot_data, temperature > 23)
iot_data[iot_data$status == "online", ]
```

### Step 6: Factors - Categorical Data

Factors are used for categorical data:

```r
# Creating factors
device_status <- factor(c("online", "offline", "online", "online"))
levels(device_status)

# Ordered factors
priority <- factor(
  c("low", "medium", "high", "medium"),
  levels = c("low", "medium", "high"),
  ordered = TRUE
)

# Converting factors
as.character(device_status)
as.numeric(device_status)  # Returns level numbers
```

### Step 7: Advanced Indexing and Subsetting

```r
# Logical indexing
temperatures <- c(22, 24, 23, 25, 21)
high_temp <- temperatures[temperatures > 23]

# Using which()
which(temperatures > 23)  # Returns indices

# Subsetting data frames with conditions
iot_data[iot_data$temperature > 23 & iot_data$status == "online", ]

# Using subset() function
subset(iot_data, temperature > 23, select = c(device_id, temperature))
```

## Exercises

1. **Vector Operations:**
   - Create a vector of 10 temperature readings (20-30 degrees)
   - Find readings above 25 degrees
   - Calculate the mean and standard deviation

2. **Data Frame Creation:**
   - Create a data frame with 5 IoT devices
   - Include columns: device_id, location, temperature, humidity
   - Add a status column with values "online" or "offline"

3. **Subsetting Practice:**
   - From your data frame, extract only online devices
   - Find devices with temperature above 23 degrees
   - Create a subset with only device_id and temperature columns

4. **List Operations:**
   - Create a list containing information about 3 devices
   - Each device should have: id, readings (vector of 5 values), status
   - Access and print the readings for the second device

## Summary

In this workshop, you've learned:
- How to create and manipulate vectors
- Working with lists for heterogeneous data
- Creating and using matrices and arrays
- Data frames for structured data
- Factors for categorical variables
- Advanced indexing and subsetting techniques

## Next Steps

- Review the example code in `examples/02-data-structures.r`
- Practice creating and manipulating different data structures
- Move on to Workshop 03: Data Generation and Simulation

## Additional Resources

- R Data Structures: https://www.statmethods.net/input/datatypes.html
- Data Frame Guide: https://www.r-bloggers.com/2020/06/data-frames-in-r/
