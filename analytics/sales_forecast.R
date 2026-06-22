#!/usr/bin/env Rscript

# Load packages cleanly
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
  
  # Parse arguments
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
  
  # Read input json
  if (input_file != "") {
    if (!file.exists(input_file)) {
      stop("Input file not found.")
    }
    input_text <- readLines(input_file, warn = FALSE)
  } else {
    input_text <- readLines(file("stdin"), warn = FALSE)
  }
  
  dataset <- fromJSON(paste(input_text, collapse = "\n")) %>% as_tibble()
  
  # Data cleaning and sorting using tidyverse
  cleaned_data <- dataset %>%
    mutate(
      date = as.Date(parse_date_time(date, orders = c("Y-m", "Y-m-d"))),
      sales = as.numeric(sales)
    ) %>%
    filter(!is.na(date) & !is.na(sales)) %>%
    arrange(date)
  
  # Fit ARIMA model
  sales_ts <- ts(cleaned_data$sales, frequency = 12)
  fit_arima <- auto.arima(sales_ts)
  
  # Forecast
  fc <- forecast(fit_arima, h = horizon)
  
  # Future Date Projection using lubridate
  last_date <- max(cleaned_data$date)
  future_dates <- seq(last_date + months(1), by = "month", length.out = horizon)
  
  # Format forecast points as tibble
  predictions <- tibble(
    date = format(future_dates, "%Y-%m"),
    predicted_sales = as.numeric(fc$mean),
    lower_80 = as.numeric(fc$lower[, 1]),
    upper_80 = as.numeric(fc$upper[, 1]),
    lower_95 = as.numeric(fc$lower[, 2]),
    upper_95 = as.numeric(fc$upper[, 2])
  )
  
  # Output JSON structure
  output <- list(
    status = "success",
    metric = "sales",
    model = "ARIMA",
    diagnostics = list(
      aic = fit_arima$aic,
      bic = fit_arima$bic,
      aicc = fit_arima$aicc
    ),
    predictions = predictions
  )
  
  cat(toJSON(output, auto_unbox = TRUE, pretty = TRUE))
}

main()
