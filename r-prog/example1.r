# Plot a Sine Wave
# This script demonstrates how to plot a sine wave in R

# Create x values from 0 to 2*pi (one complete cycle)
x <- seq(0, 2*pi, length.out = 100)

# Calculate sine values
y <- sin(x)

# Plot using base R
plot(x, y, 
     type = "l", 
     col = "blue", 
     lwd = 2,
     main = "Sine Wave",
     xlab = "x (radians)",
     ylab = "sin(x)",
     ylim = c(-1.5, 1.5))

# Add grid for better readability
grid()

# Add horizontal line at y = 0
abline(h = 0, col = "gray", lty = 2)

# Optional: Plot multiple cycles
# Uncomment the following lines to plot 3 cycles:
# x_multiple <- seq(0, 6*pi, length.out = 300)
# y_multiple <- sin(x_multiple)
# plot(x_multiple, y_multiple, 
#      type = "l", 
#      col = "blue", 
#      lwd = 2,
#      main = "Sine Wave (3 cycles)",
#      xlab = "x (radians)",
#      ylab = "sin(x)")

# Alternative: Using ggplot2 (if installed)
# Uncomment the following to use ggplot2:
# if (require(ggplot2, quietly = TRUE)) {
#   library(ggplot2)
#   df <- data.frame(x = x, y = y)
#   p <- ggplot(df, aes(x = x, y = y)) +
#     geom_line(color = "blue", size = 1) +
#     geom_hline(yintercept = 0, linetype = "dashed", color = "gray") +
#     labs(title = "Sine Wave",
#          x = "x (radians)",
#          y = "sin(x)") +
#     theme_minimal() +
#     ylim(-1.5, 1.5)
#   print(p)
# }
