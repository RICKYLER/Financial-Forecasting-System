#!/usr/bin/env Rscript

library(jsonlite)
library(forecast)
library(prophet)
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
      revenue = as.numeric(revenue)
    ) %>%
    filter(!is.na(date) & !is.na(revenue)) %>%
    arrange(date)
  
  last_date <- max(cleaned_data$date)
  future_dates <- seq(last_date + months(1), by = "month", length.out = horizon)
  
  # 1. Fit ARIMA
  rev_ts <- ts(cleaned_data$revenue, frequency = 12)
  fit_arima <- auto.arima(rev_ts)
  fc_arima <- forecast(fit_arima, h = horizon)
  
  # 2. Fit Prophet
  prophet_df <- cleaned_data %>%
    transmute(ds = date, y = revenue)
  m_prophet <- prophet(prophet_df, yearly.seasonality = TRUE, weekly.seasonality = FALSE, daily.seasonality = FALSE)
  future_df <- make_future_dataframe(m_prophet, periods = horizon, freq = "month")
  fc_prophet <- predict(m_prophet, future_df)
  
  # Filter prophet predictions to show future points only
  future_prophet <- fc_prophet %>%
    filter(ds > last_date) %>%
    as_tibble()
  
  # Compile predictions comparison
  predictions <- tibble(
    date = format(future_dates, "%Y-%m"),
    predicted_arima = as.numeric(fc_arima$mean),
    lower_arima_95 = as.numeric(fc_arima$lower[, 2]),
    upper_arima_95 = as.numeric(fc_arima$upper[, 2]),
    predicted_prophet = future_prophet$yhat,
    lower_prophet_95 = future_prophet$yhat_lower,
    upper_prophet_95 = future_prophet$yhat_upper
  )
  
  output <- list(
    status = "success",
    metric = "revenue",
    predictions = predictions
  )
  
  cat(toJSON(output, auto_unbox = TRUE, pretty = TRUE))
}

main()
