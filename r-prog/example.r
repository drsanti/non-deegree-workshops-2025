# Plot a Sine Wave
# This script demonstrates how to plot a sine wave in R

# Create x values from 0 to 2*pi (one complete cycle)
x <- seq(0, 2 * pi, length.out = 100)

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
  ylim = c(-1.5, 1.5)
)

# Add grid for better readability
grid()

# Add horizontal line at y = 0
abline(h = 0, col = "gray", lty = 2)
