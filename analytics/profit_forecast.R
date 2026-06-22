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
  
  i <- 1
  while (i <= length(args)) {
    if (args[i] == "--horizon" && i < length(args)) {
      horizon <- as.integer(args[i + 1])
      i <- i + 2
    } else if (args[i] == "--input" && i < length(args)) {
      input_file <- args[i + 1]
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
      revenue = as.numeric(revenue),
      expenses = as.numeric(expenses),
      profit = revenue - expenses
    ) %>%
    filter(!is.na(date) & !is.na(revenue) & !is.na(expenses)) %>%
    arrange(date)
  
  last_date <- max(cleaned_data$date)
  future_dates <- seq(last_date + months(1), by = "month", length.out = horizon)
  
  # Forecast Revenue using ARIMA
  rev_ts <- ts(cleaned_data$revenue, frequency = 12)
  fit_rev <- auto.arima(rev_ts)
  fc_rev <- forecast(fit_rev, h = horizon)
  
  # Forecast Expenses using ARIMA
  exp_ts <- ts(cleaned_data$expenses, frequency = 12)
  fit_exp <- auto.arima(exp_ts)
  fc_exp <- forecast(fit_exp, h = horizon)
  
  # Derive Projected Profit & Margin
  predicted_rev <- as.numeric(fc_rev$mean)
  predicted_exp <- as.numeric(fc_exp$mean)
  predicted_profit <- predicted_rev - predicted_exp
  predicted_margin <- ifelse(predicted_rev > 0, (predicted_profit / predicted_rev) * 100, 0)
  
  predictions <- tibble(
    date = format(future_dates, "%Y-%m"),
    predicted_revenue = predicted_rev,
    predicted_expenses = predicted_exp,
    predicted_profit = predicted_profit,
    predicted_margin = round(predicted_margin, 2)
  )
  
  # Run anomaly detection
  avg_hist_revenue <- mean(tail(cleaned_data$revenue, 6))
  avg_hist_expenses <- mean(tail(cleaned_data$expenses, 6))
  avg_fore_revenue <- mean(predicted_rev)
  avg_fore_expenses <- mean(predicted_exp)
  
  rev_growth <- ifelse(avg_hist_revenue > 0, ((avg_fore_revenue - avg_hist_revenue) / avg_hist_revenue) * 100, 0)
  exp_growth <- ifelse(avg_hist_expenses > 0, ((avg_fore_expenses - avg_hist_expenses) / avg_hist_expenses) * 100, 0)
  
  alerts <- list()
  if (exp_growth > rev_growth) {
    alerts <- c(alerts, list("Warning: Expense growth is projected to outpace revenue growth. Operational adjustments are recommended."))
  }
  if (any(predicted_profit < 0)) {
    alerts <- c(alerts, list("Caution: Net profit is projected to fall below zero in one or more upcoming periods."))
  }
  
  output <- list(
    status = "success",
    metric = "profit",
    revenue_growth_pct = round(rev_growth, 2),
    expense_growth_pct = round(exp_growth, 2),
    alerts = alerts,
    predictions = predictions
  )
  
  cat(toJSON(output, auto_unbox = TRUE, pretty = TRUE))
}

main()
