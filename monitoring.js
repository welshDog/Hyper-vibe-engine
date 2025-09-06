const express = require('express');
const { createLogger, format, transports } = require('winston');
const expressWinston = require('express-winston');
const path = require('path');

// Create logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'hyper-vibe-engine' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Request logging middleware
const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
});

// Error logging middleware
const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger
});

module.exports = {
  logger,
  requestLogger,
  errorLogger
};
