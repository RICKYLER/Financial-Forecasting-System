#!/usr/bin/env Rscript

library(jsonlite)
library(forecast)
library(dplyr)
library(lubridate)
library(purrr)

options(warn = -1)

main <- function() {
  args <- commandArgs(trailingOnly = TRUE)
  horizon <- 12
  input_file <- ""
  fixed_cost_base <- 20000 # Default assumed fixed overhead
  
  i <- 1
  while (i <= length(args)) {
    if (args[i] == "--horizon" && i < length(args)) {
      horizon <- as.integer(args[i + 1])
      i <- i + 2
    } else if (args[i] == "--input" && i < length(args)) {
      input_file = args[i + 1]
      i <- i + 2
    } else if (args[i] == "--fixed" && i < length(args)) {
      fixed_cost_base = as.numeric(args[i + 1])
      i <- i + 2
    } else {
      i <- i + 1
    }
  }
  
  if (input_file != "") {
    if (!file.exists(input_file)) {
      stop("Input file not found.")
    }
    input_text <- readLines(input_file, warn = FALSE)
  } else {
    input_text <- readLines(file("stdin"), warn = FALSE)
  }
  
  dataset <- fromJSON(paste(input_text, collapse = "\n")) %>% as_tibble()
  
  cleaned_data <- dataset %>%
    mutate(
      date = as.Date(parse_date_time(date, orders = c("Y-m", "Y-m-d"))),
      expenses = as.numeric(expenses)
    ) %>%
    filter(!is.na(date) & !is.na(expenses)) %>%
    arrange(date)
  
  # Fit ARIMA model on historical total expenses
  exp_ts <- ts(cleaned_data$expenses, frequency = 12)
  fit_arima <- auto.arima(exp_ts)
  fc <- forecast(fit_arima, h = horizon)
  
  last_date <- max(cleaned_data$date)
  future_dates <- seq(last_date + months(1), by = "month", length.out = horizon)
  
  # Map outputs, separating fixed and variable components
  predictions <- tibble(
    date = format(future_dates, "%Y-%m"),
    predicted_expenses = as.numeric(fc$mean),
    fixed_component = fixed_cost_base,
    variable_component = pmax(0, as.numeric(fc$mean) - fixed_cost_base),
    lower_95 = as.numeric(fc$lower[, 2]),
    upper_95 = as.numeric(fc$upper[, 2])
  )
  
  output <- list(
    status = "success",
    metric = "expenses",
    assumed_fixed_overhead = fixed_cost_base,
    predictions = predictions
  )
  
  cat(toJSON(output, auto_unbox = TRUE, pretty = TRUE))
}

main()
